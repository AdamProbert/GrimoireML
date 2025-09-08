from pydantic import BaseModel
from functools import lru_cache
import os


class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "card-db")
    version: str = os.getenv("VERSION", "0.1.0")
    environment: str = os.getenv("ENVIRONMENT", "local")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    image_cache_ttl: int = int(os.getenv("IMAGE_CACHE_TTL", "86400"))
    image_negative_cache_ttl: int = int(os.getenv("IMAGE_NEG_CACHE_TTL", "300"))
    image_fetch_timeout: float = float(os.getenv("IMAGE_FETCH_TIMEOUT", "10"))
    image_download_timeout: float = float(os.getenv("IMAGE_DOWNLOAD_TIMEOUT", "15"))
    image_fetch_retries: int = int(os.getenv("IMAGE_FETCH_RETRIES", "3"))
    image_retry_backoff_base: float = float(
        os.getenv("IMAGE_RETRY_BACKOFF_BASE", "0.2")
    )
    image_concurrency_limit: int = int(os.getenv("IMAGE_CONCURRENCY_LIMIT", "25"))
    image_circuit_threshold: int = int(os.getenv("IMAGE_CIRCUIT_THRESHOLD", "20"))
    image_circuit_window_seconds: int = int(
        os.getenv("IMAGE_CIRCUIT_WINDOW_SECONDS", "60")
    )
    image_circuit_open_seconds: int = int(os.getenv("IMAGE_CIRCUIT_OPEN_SECONDS", "30"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
