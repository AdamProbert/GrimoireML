import httpx
import logging
import asyncio
from fastapi import HTTPException
from redis import asyncio as redis_async
from app.core.config import get_settings, Settings
from circuitbreaker import CircuitBreaker

logger = logging.getLogger("card-db-images")

_redis: redis_async.Redis | None = None
_lock = asyncio.Lock()
_semaphore: asyncio.Semaphore | None = None

SCRYFALL_CARD_ENDPOINT = "https://api.scryfall.com/cards/"

# Initialize circuit breaker from settings
_settings = get_settings()
image_circuit_breaker = CircuitBreaker(
    failure_threshold=_settings.image_circuit_threshold,
    recovery_timeout=_settings.image_circuit_open_seconds,
    expected_exception=Exception,
)


async def get_redis(settings: Settings) -> redis_async.Redis:
    global _redis
    if _redis is None:
        async with _lock:
            if _redis is None:
                _redis = redis_async.from_url(
                    settings.redis_url, decode_responses=False
                )
    return _redis


@image_circuit_breaker
async def fetch_scryfall_image(card_id: str, settings: Settings) -> tuple[bytes, str]:
    url = SCRYFALL_CARD_ENDPOINT + card_id
    attempt = 0
    last_error: Exception | None = None
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
    if last_error:
        logger.error(
            "fetch_scryfall_image_exhausted", card_id=card_id, error=str(last_error)
        )
    raise HTTPException(status_code=502, detail="Exhausted retries")


async def ensure_semaphore(settings: Settings) -> asyncio.Semaphore:
    global _semaphore
    if _semaphore is None:
        async with _lock:
            if _semaphore is None:
                _semaphore = asyncio.Semaphore(settings.image_concurrency_limit)
    return _semaphore
