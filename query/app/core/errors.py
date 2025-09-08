"""Error handling utilities (moved to core)."""

from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)


async def validation_exception_handler(request: Request, exc: ValidationError):  # type: ignore[override]
    logger.warning("Validation error: %s", exc)
    return JSONResponse(
        status_code=422, content={"error": "validation_error", "details": exc.errors()}
    )


async def runtime_exception_handler(request: Request, exc: Exception):  # type: ignore[override]
    logger.error("Unhandled error", exc_info=exc)
    return JSONResponse(status_code=500, content={"error": "internal_error"})


__all__ = [
    "validation_exception_handler",
    "runtime_exception_handler",
]
