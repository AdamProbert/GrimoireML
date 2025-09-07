"""Redis cache helpers."""

from __future__ import annotations

import hashlib
import json
import logging

import redis.asyncio as redis

from .config import settings
from .models import QueryIR

logger = logging.getLogger(__name__)

_redis: redis.Redis | None = None


async def init_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )
        await _redis.ping()
        logger.info("Connected to Redis at %s", settings.redis_url)
    return _redis


def text_key(text: str) -> str:
    return "nlq:" + hashlib.sha1(text.encode()).hexdigest()


def ir_key(ir_json: str) -> str:
    return "ir:" + hashlib.sha1(ir_json.encode()).hexdigest()


async def get_ir_for_text(text: str) -> QueryIR | None:
    r = await init_redis()
    raw = await r.get(text_key(text))
    if raw:
        try:
            data = json.loads(raw)
            return QueryIR.model_validate(data)
        except Exception:  # noqa
            logger.warning("Failed to deserialize IR from cache")
    return None


async def cache_ir(text: str, ir: QueryIR):
    r = await init_redis()
    raw = ir.model_dump_json()
    await r.set(text_key(text), raw, ex=settings.cache_ttl_secs)


async def get_compiled_query(ir: QueryIR) -> str | None:
    r = await init_redis()
    raw = ir.model_dump_json()
    ck = ir_key(raw)
    return await r.get(ck)


async def cache_compiled_query(ir: QueryIR, query: str):
    r = await init_redis()
    raw = ir.model_dump_json()
    ck = ir_key(raw)
    await r.set(ck, query, ex=settings.cache_ttl_secs)
