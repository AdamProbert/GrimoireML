from fastapi import FastAPI
from .core.config import get_settings
from .routers import health

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.include_router(health.router)


@app.get("/", summary="Root", tags=["root"])
async def root():
    return {"message": f"Welcome to {settings.app_name}"}
