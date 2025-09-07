# GrimoireML Query Service

Natural language → structured IR → Scryfall query microservice.

## Features

- POST `/nlq/parse`: parse NL text into `QueryIR` + compiled Scryfall query string
- GET `/health` readiness probe (returns `{ "status": "ok", "timestamp": ... }`)
- OpenAPI docs at `/docs`, `/redoc`, spec at `/openapi.json`
- Deterministic compiler from IR → Scryfall query
- OpenAI few‑shot assisted parsing (1 retry) then rule‑based fallback
- Redis caching for IR & compiled query (TTL configurable)

## Models (IR)

See `app/models.py` for full Pydantic v2 definitions: `QueryIR`, `Entity`, `Colors`, `CompareNumber`, etc.

## Caching

Keys:

- `nlq:<sha1(text)>` → serialized IR JSON
- `ir:<sha1(ir_json)>` → compiled query string

TTL: `CACHE_TTL_SECS` (default 1800 seconds).

## Environment Variables

Minimal surface (only OpenAI key required — Redis defaults to docker-compose service host `redis`):

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| OPENAI_API_KEY | yes | — | OpenAI API key |
| OPENAI_MODEL | no | gpt-4o-mini | Chat model name |
| REDIS_URL | no | redis://redis:6379/0 | Redis URL |
| CACHE_TTL_SECS | no | 1800 | Cache TTL (seconds) |

## Recommended: docker-compose (from repo root)

The root `docker-compose.yml` already provisions `redis` and maps this service to port 8080 (adjust if you add a service entry):

```bash
export OPENAI_API_KEY=sk-...yourkey...
docker-compose up -d --build
```

Then visit:

- <http://localhost:8080/docs>
- <http://localhost:8080/health>

## Manual Dev Run (optional)

```bash
cd query
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...yourkey...
uvicorn app.main:app --reload --port 8080
```

## Request Example

```bash
curl -s -X POST localhost:8080/nlq/parse \
  -H 'Content-Type: application/json' \
  -d '{"text":"mono white angels mv<=5 legal commander"}' | jq
```
