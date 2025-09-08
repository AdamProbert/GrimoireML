"""FastAPI application entrypoint for card-db microservice."""

from __future__ import annotations
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

from app.core.config import get_settings
from app.routers.images import router as images_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("card-db")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # No special startup tasks yet
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(images_router)


# Health endpoint
@app.get("/health", tags=["health"], summary="Health check")
async def health():
    return {"status": "ok"}


# Metrics
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


def _looks_like_id(segment: str) -> bool:
    if (
        len(segment) >= 8
        and any(c.isalpha() for c in segment)
        and any(c.isdigit() for c in segment)
    ):
        return True
    return False


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = request.url.path
    norm = "/".join(
        [p if not _looks_like_id(p) else "{id}" for p in path.split("/") if p]
    )
    norm_path = f"/{norm}" if norm else "/"
    REQUEST_COUNT.labels(request.method, norm_path, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, norm_path).observe(
        time.perf_counter() - start
    )
    return response


@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
