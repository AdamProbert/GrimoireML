from pydantic import BaseModel
from functools import lru_cache
import os


class Settings(BaseModel):
    app_name: str = "backend"
    version: str = "0.1.0"
    environment: str = os.getenv("ENVIRONMENT", "local")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    database_url: str = os.getenv(
        "DATABASE_URL",
        # default dev DSN; docker-compose will override
        "postgresql+asyncpg://postgres:postgres@localhost:5432/grimoire",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
