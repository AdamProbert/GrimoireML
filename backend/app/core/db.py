from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
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
    # Import models so metadata is populated
    from ..models.deck import Deck, DeckCard  # noqa: F401

    # Retry a few times in case Postgres isn't ready yet (docker startup race)
    import asyncio
    import logging

    max_attempts = 8
    delay = 1.5
    for attempt in range(1, max_attempts + 1):
        try:
            async with engine.begin() as conn:
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
