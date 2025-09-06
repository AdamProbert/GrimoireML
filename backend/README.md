# GrimoireML Backend (FastAPI)

Lightweight FastAPI backend used by the GrimoireML frontend. Intended as a small prototype skeleton that can be extended with a persistent database, caching, and vector store.

## Key features

- FastAPI app with OpenAPI schema (`/openapi.json`) and Swagger UI at `/docs`.
- Health endpoint at `/health` and a simple root message.
- Image proxy and basic decks router (placeholders for business logic).
- Settings via `core.config.get_settings()` and async DB init placeholder in `core.db`.

## Routes of interest

- `GET /` — root welcome message
- `GET /health` — health check used by docker-compose
- `GET /images/...` — image proxy/caching endpoints (see `app/routers/images.py`)
- `GET /decks/...` — deck-related routes (see `app/routers/decks.py`)

## Run locally (dev)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run with Docker (from repo root)

```bash
docker build -t grimoire-backend:local ./backend
docker run -p 8000:8000 grimoire-backend:local
```

## Notes

- The project currently uses permissive CORS to simplify local development; tighten this for production.
- Database initialization is a placeholder. The `docker-compose.yml` includes a Postgres service and sets `DATABASE_URL` for local integration.
- Add unit tests and CI before making breaking changes.
