"""Natural language query parsing endpoints."""

from __future__ import annotations

import time
from fastapi import APIRouter
from prometheus_client import Counter, Histogram
from app.models import ParseRequest, ParseResponse
from app.services import cache
from app.services.llm import parse_nl_query
from app.services.compiler import compile_to_scryfall

router = APIRouter(prefix="/nlq", tags=["Parsing"])

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
WARNINGS_COUNT = Counter(
    "parse_warnings_total",
    "Warnings produced in parse pipeline",
    ["source"],
    namespace="grimoire",
    subsystem="query",
)


@router.post(
    "/parse", response_model=ParseResponse, summary="Parse natural language query"
)
async def parse_endpoint(req: ParseRequest):
    t0 = time.perf_counter()
    cache_state = "miss"
    status = "ok"
    warnings: list[str] = []
    try:
        ir = await cache.get_ir_for_text(req.text)
        if ir is not None:
            CACHE_IR_LOOKUPS.labels("hit").inc()
            cache_state = "ir_hit"
        else:
            CACHE_IR_LOOKUPS.labels("miss").inc()
            ir, warnings_llm = parse_nl_query(req.text)
            for _ in warnings_llm:
                WARNINGS_COUNT.labels("llm").inc()
            warnings.extend(warnings_llm)
            await cache.cache_ir(req.text, ir)

        compiled, compiled_parts, comp_warnings = compile_to_scryfall(ir)
        for _ in comp_warnings:
            WARNINGS_COUNT.labels("compile").inc()
        warnings.extend(comp_warnings)
        PARSE_REQUESTS.labels(cache_state, status).inc()
        return ParseResponse(
            ir=ir, query=compiled, query_parts=compiled_parts, warnings=warnings
        )
    except Exception:  # noqa
        status = "error"
        PARSE_REQUESTS.labels(cache_state, status).inc()
        raise
    finally:
        PARSE_LATENCY.observe(time.perf_counter() - t0)


__all__ = ["router"]
