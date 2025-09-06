from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(tags=["health"], prefix="/health")


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime


@router.get("/", response_model=HealthResponse, summary="Health check")
async def get_health():
    return HealthResponse(status="ok", timestamp=datetime.utcnow())
