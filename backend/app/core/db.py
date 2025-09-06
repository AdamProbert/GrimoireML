import asyncio
import logging
import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.database_url, echo=settings.debug)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:  # type: ignore
        yield session


async def init_db() -> None:
    max_attempts = 8
    delay = 1.5
    for attempt in range(1, max_attempts + 1):
        try:
            async with engine.begin() as conn:
                # Optional destructive reset if env var set (use once, then unset)
                if os.getenv("RESET_DB", "false").lower() == "true":
                    await conn.run_sync(Base.metadata.drop_all)
                await conn.run_sync(Base.metadata.create_all)
            break
        except Exception as e:  # noqa: BLE001
            if attempt == max_attempts:
                logging.exception("Database init failed after retries")
                raise
            logging.warning(
                "DB init attempt %s failed: %s (retrying in %.1fs)", attempt, e, delay
            )
            await asyncio.sleep(delay)
