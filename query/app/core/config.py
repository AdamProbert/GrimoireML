"""Configuration for grimoireml-query service (refactored into core package)."""

from __future__ import annotations

import os
from functools import lru_cache
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "GrimoireML Query Service")
    app_version: str = os.getenv("APP_VERSION", "0.1.0")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    cache_ttl_secs: int = int(os.getenv("CACHE_TTL_SECS", "1800"))
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "*")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    s = Settings()
    if not s.openai_api_key:
        raise RuntimeError("Missing required environment variable: OPENAI_API_KEY")
    return s


settings = get_settings()

__all__ = ["Settings", "settings", "get_settings"]
