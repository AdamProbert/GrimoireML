from fastapi import APIRouter, HTTPException, Response, Depends
import httpx
import asyncio
import time
import logging
from redis import asyncio as redis_async  # redis-py asyncio API
from prometheus_client import Counter, Histogram, Gauge
from ..core.config import get_settings, Settings

logger = logging.getLogger("images")
router = APIRouter(prefix="/images", tags=["images"])

# Simple singleton cache of Redis connection
_redis: redis_async.Redis | None = None
_lock = asyncio.Lock()

# Concurrency limiter (initialized later with settings)
_semaphore: asyncio.Semaphore | None = None

# Circuit breaker state (simple sliding window failure counter)
_failure_times: list[float] = []  # timestamps of failures
_circuit_open_until: float = 0.0

# Metrics
IMAGE_REQUESTS = Counter(
    "image_requests_total",
    "Image requests",
    ["source", "outcome"],  # source: cache, origin; outcome: hit, miss, error
)
IMAGE_FETCH_LATENCY = Histogram(
    "image_origin_fetch_latency_seconds",
    "Latency for origin fetch (metadata + image)",
    buckets=(0.1, 0.25, 0.5, 1, 2, 5, 10),
)
IMAGE_CACHE_BYTES = Gauge(
    "image_cache_bytes_last",
    "Size of last image cached in bytes",
)
IMAGE_CIRCUIT_STATE = Gauge(
    "image_circuit_open",
    "1 if circuit breaker open else 0",
)


async def get_redis(settings: Settings) -> redis_async.Redis:
    global _redis
    if _redis is None:
        async with _lock:
            if _redis is None:
                # decode_responses False to keep bytes
                _redis = redis_async.from_url(
                    settings.redis_url, decode_responses=False
                )
    return _redis


SCRYFALL_CARD_ENDPOINT = "https://api.scryfall.com/cards/"  # + {id}


async def fetch_scryfall_image(card_id: str, settings: Settings) -> tuple[bytes, str]:
    """Fetch metadata then image with retries and backoff."""
    url = SCRYFALL_CARD_ENDPOINT + card_id
    attempt = 0
    last_error: Exception | None = None
    t0 = time.perf_counter()
    while attempt < settings.image_fetch_retries:
        try:
            timeout = httpx.Timeout(settings.image_fetch_timeout)
            async with httpx.AsyncClient(timeout=timeout) as client:
                r = await client.get(url)
            if r.status_code == 404:
                raise HTTPException(status_code=404, detail="Card not found")
            if r.status_code >= 500:
                raise HTTPException(
                    status_code=502, detail=f"Upstream 5xx {r.status_code}"
                )
            if r.status_code >= 400:
                # treat 4xx (non-404) as not retryable
                raise HTTPException(
                    status_code=502, detail=f"Upstream error {r.status_code}"
                )
            data = r.json()
            image_url = (
                data.get("image_uris", {}).get("normal")
                or data.get("image_uris", {}).get("small")
                or data.get("image_uris", {}).get("png")
            )
            if not image_url and data.get("card_faces"):
                face = data["card_faces"][0]
                image_url = (
                    face.get("image_uris", {}).get("normal")
                    or face.get("image_uris", {}).get("small")
                    or face.get("image_uris", {}).get("png")
                )
            if not image_url:
                raise HTTPException(
                    status_code=404, detail="No image available for card"
                )
            # Download image
            timeout_img = httpx.Timeout(settings.image_download_timeout)
            async with httpx.AsyncClient(timeout=timeout_img) as client:
                img_res = await client.get(image_url)
            if img_res.status_code >= 500:
                raise HTTPException(status_code=502, detail="Failed to fetch image 5xx")
            if img_res.status_code >= 400:
                raise HTTPException(status_code=502, detail="Failed to fetch image")
            content_type = img_res.headers.get("content-type", "image/jpeg")
            return img_res.content, content_type
        except HTTPException as e:
            # Retry for 502 (we mapped 5xx) only
            if e.status_code == 502 and attempt + 1 < settings.image_fetch_retries:
                backoff = settings.image_retry_backoff_base * (2**attempt)
                await asyncio.sleep(backoff)
                attempt += 1
                last_error = e
                continue
            raise
        except (httpx.RequestError, asyncio.TimeoutError) as e:
            last_error = e
            if attempt + 1 >= settings.image_fetch_retries:
                raise HTTPException(
                    status_code=502, detail="Network error fetching image"
                )
            backoff = settings.image_retry_backoff_base * (2**attempt)
            await asyncio.sleep(backoff)
            attempt += 1
    # Should not reach
    if last_error:
        logger.error(
            "fetch_scryfall_image_exhausted", card_id=card_id, error=str(last_error)
        )
    raise HTTPException(status_code=502, detail="Exhausted retries")


async def _ensure_semaphore(settings: Settings):
    global _semaphore
    if _semaphore is None:
        async with _lock:
            if _semaphore is None:
                _semaphore = asyncio.Semaphore(settings.image_concurrency_limit)
    return _semaphore


def _circuit_open(now: float, settings: Settings) -> bool:
    global _circuit_open_until
    if now < _circuit_open_until:
        return True
    return False


def _record_failure(now: float, settings: Settings):
    global _failure_times, _circuit_open_until
    _failure_times.append(now)
    # Trim old
    window_start = now - settings.image_circuit_window_seconds
    while _failure_times and _failure_times[0] < window_start:
        _failure_times.pop(0)
    if len(_failure_times) >= settings.image_circuit_threshold:
        _circuit_open_until = now + settings.image_circuit_open_seconds
        IMAGE_CIRCUIT_STATE.set(1)
        logger.warning(
            "image_circuit_opened",
            extra={
                "failures_in_window": len(_failure_times),
                "window_seconds": settings.image_circuit_window_seconds,
            },
        )


def _record_success():
    global _failure_times, _circuit_open_until
    if _failure_times:
        _failure_times.clear()
    _circuit_open_until = 0
    IMAGE_CIRCUIT_STATE.set(0)


@router.get("/{card_id}", summary="Get card image")
async def get_card_image(card_id: str, settings: Settings = Depends(get_settings)):
    now = time.time()
    if _circuit_open(now, settings):
        IMAGE_REQUESTS.labels("origin", "error").inc()
        raise HTTPException(
            status_code=503,
            detail="Image service temporarily unavailable (circuit open)",
        )

    redis = await get_redis(settings)
    sem = await _ensure_semaphore(settings)
    key = f"cardimg:{card_id}"
    neg_key = f"cardimgneg:{card_id}"

    # Negative cache check
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
    # Protect upstream with semaphore
    async with sem:
        try:
            with IMAGE_FETCH_LATENCY.time():
                img_bytes, content_type = await fetch_scryfall_image(card_id, settings)
        except HTTPException as e:
            if e.status_code == 404:
                await redis.setex(neg_key, settings.image_negative_cache_ttl, b"1")
            else:
                _record_failure(time.time(), settings)
            IMAGE_REQUESTS.labels("origin", "error").inc()
            raise
        except Exception as e:  # noqa
            _record_failure(time.time(), settings)
            IMAGE_REQUESTS.labels("origin", "error").inc()
            logger.exception("image_fetch_unhandled", extra={"card_id": card_id})
            raise HTTPException(status_code=502, detail="Unhandled image fetch error")
    # Success
    _record_success()
    await redis.setex(key, settings.image_cache_ttl, img_bytes)
    IMAGE_CACHE_BYTES.set(len(img_bytes))
    IMAGE_REQUESTS.labels("origin", "success").inc()
    return Response(content=img_bytes, media_type=content_type)
