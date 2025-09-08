"""FastAPI application entrypoint for grimoireml-query (refactored)."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from pydantic import ValidationError

from app.core.config import settings
from app.core.errors import (
    validation_exception_handler,
    runtime_exception_handler,
)
from app.services.cache import init_redis
from app.routers.health import router as health_router
from app.routers.nlq import router as nlq_router

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("grimoireml-query")


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[override]
    try:
        await init_redis()
    except Exception as e:  # noqa
        logger.error("Failed to connect to Redis: %s", e)
        raise
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Natural language to Scryfall query compiler for GrimoireML. Converts user text into a structured IR "
        "and deterministic Scryfall search string."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(Exception, runtime_exception_handler)

# Routers
app.include_router(health_router)
app.include_router(nlq_router)


@app.get("/metrics", include_in_schema=False)
async def metrics_endpoint():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


__all__ = ["app"]
