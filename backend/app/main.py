from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .routers import health
from .routers import decks
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time
from .core.db import init_db
from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown (nothing yet)


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.include_router(health.router)
app.include_router(decks.router)

# Basic metrics
REQUEST_COUNT = Counter(
    "requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
    namespace="grimoire",
    subsystem=settings.app_name,
)
REQUEST_LATENCY = Histogram(
    "request_latency_seconds",
    "Request latency seconds",
    ["method", "path"],
    buckets=(0.05, 0.1, 0.25, 0.5, 1, 2, 5),
    namespace="grimoire",
    subsystem=settings.app_name,
)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = request.url.path
    # Avoid high cardinality (strip numeric/uuid segments rudimentary)
    norm_path = "/".join(
        [p if not _looks_like_id(p) else "{id}" for p in path.split("/") if p]
    )
    REQUEST_COUNT.labels(
        request.method, f"/{norm_path}" if norm_path else "/", response.status_code
    ).inc()
    REQUEST_LATENCY.labels(
        request.method, f"/{norm_path}" if norm_path else "/"
    ).observe(time.perf_counter() - start)
    return response


def _looks_like_id(segment: str) -> bool:
    if (
        len(segment) >= 8
        and any(c.isalpha() for c in segment)
        and any(c.isdigit() for c in segment)
    ):
        return True
    return False


# Basic permissive CORS for dev; tighten in production as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", summary="Root", tags=["root"])
async def root():
    return {"message": f"Welcome to {settings.app_name}"}


@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
