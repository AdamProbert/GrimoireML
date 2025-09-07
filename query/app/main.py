"""FastAPI application entrypoint for grimoireml-query."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, APIRouter, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError

from .config import settings
from .models import ParseRequest, ParseResponse
from .compiler import compile_to_scryfall
from . import cache
from .llm import parse_nl_query
from .errors import validation_exception_handler, runtime_exception_handler
from prometheus_client import (
    Counter,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
import time

# Metrics
PARSE_REQUESTS = Counter(
    "parse_requests_total",
    "Total /nlq/parse requests",
    ["cache_state", "status"],
    namespace="grimoire",
    subsystem="query",
)
PARSE_LATENCY = Histogram(
    "parse_latency_seconds",
    "End-to-end latency of /nlq/parse handler",
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5),
    namespace="grimoire",
    subsystem="query",
)
CACHE_IR_LOOKUPS = Counter(
    "cache_ir_lookups_total",
    "IR cache lookups",
    ["result"],
    namespace="grimoire",
    subsystem="query",
)
CACHE_COMPILE_LOOKUPS = Counter(
    "cache_compile_lookups_total",
    "Compiled query cache lookups",
    ["result"],
    namespace="grimoire",
    subsystem="query",
)
WARNINGS_COUNT = Counter(
    "parse_warnings_total",
    "Warnings produced in parse pipeline",
    ["source"],
    namespace="grimoire",
    subsystem="query",
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("grimoireml-query")


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[override]
    try:
        await cache.init_redis()
    except Exception as e:  # noqa
        logger.error("Failed to connect to Redis: %s", e)
        raise
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Natural language to Scryfall query compiler for GrimoireML. Converts user text into a structured IR and deterministic Scryfall search string.",
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Parsing", "description": "Natural language query parsing"},
        {"name": "health", "description": "Health & readiness"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(Exception, runtime_exception_handler)

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime


health_router = APIRouter(tags=["health"], prefix="/health")


@health_router.get("/", response_model=HealthResponse, summary="Health check")
async def get_health():
    return HealthResponse(status="ok", timestamp=datetime.utcnow())


@router.post("/nlq/parse", response_model=ParseResponse, tags=["Parsing"])
async def parse_endpoint(req: ParseRequest):
    t0 = time.perf_counter()
    cache_state = "miss"
    status = "ok"
    warnings: list[str] = []
    try:
        # Cache check for IR
        ir = await cache.get_ir_for_text(req.text)
        if ir is not None:
            CACHE_IR_LOOKUPS.labels("hit").inc()
        else:
            CACHE_IR_LOOKUPS.labels("miss").inc()
            ir, warnings_llm = parse_nl_query(req.text)
            for w in warnings_llm:
                WARNINGS_COUNT.labels("llm").inc()
            warnings.extend(warnings_llm)
            await cache.cache_ir(req.text, ir)

        # Compile (with caching of compiled query)
        compiled = await cache.get_compiled_query(ir)
        if compiled is not None:
            CACHE_COMPILE_LOOKUPS.labels("hit").inc()
            cache_state = (
                "ir_hit" if CACHE_IR_LOOKUPS._metrics.get(("hit",)) else "comp_hit"
            )  # best-effort
        else:
            CACHE_COMPILE_LOOKUPS.labels("miss").inc()
            compiled, comp_warnings = compile_to_scryfall(ir)
            for w in comp_warnings:
                WARNINGS_COUNT.labels("compile").inc()
            warnings.extend(comp_warnings)
            await cache.cache_compiled_query(ir, compiled)
        PARSE_REQUESTS.labels(cache_state, status).inc()
        return ParseResponse(
            ir=ir, query=compiled, query_parts=compiled.split(" "), warnings=warnings
        )
    except Exception:  # noqa
        status = "error"
        PARSE_REQUESTS.labels(cache_state, status).inc()
        raise
    finally:
        PARSE_LATENCY.observe(time.perf_counter() - t0)


@app.get("/metrics", include_in_schema=False)
async def metrics_endpoint():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(router)
app.include_router(health_router)


__all__ = ["app"]
