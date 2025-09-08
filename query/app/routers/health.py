"""Health router."""

from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime


@router.get("/", response_model=HealthResponse, summary="Health check")
async def get_health():
    return HealthResponse(status="ok", timestamp=datetime.utcnow())


__all__ = ["router"]
