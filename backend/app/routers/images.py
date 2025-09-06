from fastapi import APIRouter, HTTPException, Response
from fastapi import Depends
import httpx
import asyncio
from redis import asyncio as redis_async  # redis-py asyncio API
from ..core.config import get_settings, Settings

router = APIRouter(prefix="/images", tags=["images"])

# Simple singleton cache of Redis connection
_redis: redis_async.Redis | None = None
_lock = asyncio.Lock()


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


async def fetch_scryfall_image(card_id: str) -> tuple[bytes, str]:
    url = SCRYFALL_CARD_ENDPOINT + card_id
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        if r.status_code == 404:
            raise HTTPException(status_code=404, detail="Card not found")
        if r.status_code >= 400:
            raise HTTPException(
                status_code=502, detail=f"Scryfall error {r.status_code}"
            )
        data = r.json()
    image_url = (
        data.get("image_uris", {}).get("normal")
        or data.get("image_uris", {}).get("small")
        or data.get("image_uris", {}).get("png")
    )
    # Double faced cards
    if not image_url and data.get("card_faces"):
        face = data["card_faces"][0]
        image_url = (
            face.get("image_uris", {}).get("normal")
            or face.get("image_uris", {}).get("small")
            or face.get("image_uris", {}).get("png")
        )
    if not image_url:
        raise HTTPException(status_code=404, detail="No image available for card")
    async with httpx.AsyncClient(timeout=15) as client:
        img_res = await client.get(image_url)
        if img_res.status_code >= 400:
            raise HTTPException(status_code=502, detail="Failed to fetch image")
        content_type = img_res.headers.get("content-type", "image/jpeg")
        return img_res.content, content_type


@router.get("/{card_id}", summary="Get card image")
async def get_card_image(card_id: str, settings: Settings = Depends(get_settings)):
    redis = await get_redis(settings)
    key = f"cardimg:{card_id}"
    cached = await redis.get(key)
    if cached:
        # We stored as bytes; redis returns bytes already (decode_responses False)
        # First few bytes might let us infer type but we store side channel header hash
        # Minimal: assume jpeg/png based on magic numbers
        content_type = (
            "image/png" if cached[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"
        )
        return Response(content=cached, media_type=content_type)
    # Not cached
    img_bytes, content_type = await fetch_scryfall_image(card_id)
    # Store with TTL
    await redis.setex(key, settings.image_cache_ttl, img_bytes)
    return Response(content=img_bytes, media_type=content_type)
