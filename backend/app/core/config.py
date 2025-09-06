from pydantic import BaseModel
from functools import lru_cache
import os


class Settings(BaseModel):
    app_name: str = "GrimoireML API"
    version: str = "0.1.0"
    environment: str = os.getenv("ENVIRONMENT", "local")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"


@lru_cache
def get_settings() -> Settings:
    return Settings()
