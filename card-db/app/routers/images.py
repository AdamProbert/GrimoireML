from fastapi import APIRouter, HTTPException, Response, Depends
import time
import logging
from app.services.image_service import (
    get_redis,
    fetch_scryfall_image,
    ensure_semaphore,
    circuit_open,
    record_failure,
    record_success,
)
from prometheus_client import Counter, Histogram, Gauge
from app.core.config import get_settings, Settings

logger = logging.getLogger("card-db-images")
router = APIRouter(prefix="/images", tags=["images"])

# Metrics
IMAGE_REQUESTS = Counter(
    "image_requests_total",
    "Image requests",
    ["source", "outcome"],
    namespace="grimoire",
    subsystem="card-db",
)
IMAGE_FETCH_LATENCY = Histogram(
    "image_origin_fetch_latency_seconds",
    "Latency for origin fetch (metadata + image)",
    buckets=(0.1, 0.25, 0.5, 1, 2, 5, 10),
    namespace="grimoire",
    subsystem="card-db",
)
IMAGE_CIRCUIT_STATE = Gauge(
    "image_circuit_open",
    "1 if circuit breaker open else 0",
    namespace="grimoire",
    subsystem="card-db",
)

SCRYFALL_CARD_ENDPOINT = "https://api.scryfall.com/cards/"


@router.get("/{card_id}", summary="Get card image")
async def get_card_image(card_id: str, settings: Settings = Depends(get_settings)):
    now = time.time()
    # Circuit breaker open? update gauge and reject
    if circuit_open(now, settings):
        IMAGE_CIRCUIT_STATE.set(1)
        IMAGE_REQUESTS.labels("origin", "error").inc()
        raise HTTPException(
            status_code=503, detail="Image service unavailable (circuit open)"
        )
    redis = await get_redis(settings)
    key, neg_key = f"cardimg:{card_id}", f"cardimgneg:{card_id}"
    if await redis.exists(neg_key):
        IMAGE_REQUESTS.labels("cache", "hit").inc()
        raise HTTPException(status_code=404, detail="Previously not found")
    cached = await redis.get(key)
    if cached:
        content_type = (
            "image/png" if cached[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"
        )
        IMAGE_REQUESTS.labels("cache", "hit").inc()
        return Response(content=cached, media_type=content_type)
    IMAGE_REQUESTS.labels("cache", "miss").inc()
    async with ensure_semaphore(settings):
        try:
            with IMAGE_FETCH_LATENCY.time():
                img_bytes, content_type = await fetch_scryfall_image(card_id, settings)
        except HTTPException as e:
            if e.status_code == 404:
                await redis.setex(neg_key, settings.image_negative_cache_ttl, b"1")
            else:
                record_failure(time.time(), settings)
                IMAGE_CIRCUIT_STATE.set(1)
            IMAGE_REQUESTS.labels("origin", "error").inc()
            raise
        except Exception:
            record_failure(time.time(), settings)
            IMAGE_REQUESTS.labels("origin", "error").inc()
            logger.exception("unhandled fetch error", extra={"card_id": card_id})
            raise HTTPException(status_code=502, detail="Fetch error")
    # Success: reset circuit breaker state
    record_success()
    IMAGE_CIRCUIT_STATE.set(0)
    await redis.setex(key, settings.image_cache_ttl, img_bytes)
    IMAGE_REQUESTS.labels("origin", "success").inc()
    return Response(content=img_bytes, media_type=content_type)
