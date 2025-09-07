"""FastAPI application entrypoint for grimoireml-query."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError

from .config import settings
from .models import ParseRequest, ParseResponse
from .compiler import compile_to_scryfall
from . import cache
from .llm import parse_nl_query
from .errors import validation_exception_handler, runtime_exception_handler

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
    # Cache check for IR
    ir = await cache.get_ir_for_text(req.text)
    warnings: list[str] = []
    if ir is None:
        ir, warnings_llm = parse_nl_query(req.text)
        warnings.extend(warnings_llm)
        await cache.cache_ir(req.text, ir)

    # Compile (with caching of compiled query)
    compiled = await cache.get_compiled_query(ir)
    if compiled is None:
        compiled, comp_warnings = compile_to_scryfall(ir)
        warnings.extend(comp_warnings)
        await cache.cache_compiled_query(ir, compiled)
    return ParseResponse(
        ir=ir, query=compiled, query_parts=compiled.split(" "), warnings=warnings
    )


app.include_router(router)
app.include_router(health_router)


__all__ = ["app"]
