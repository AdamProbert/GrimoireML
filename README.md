# Grimoire ML

<img align="right" width="33%" src="webapp/assets/gimoire-ml-logo-1000x1000.png">

Grimoire ML is an AI-assisted Magic: The Gathering card discovery and deckbuilding web application.

---
This mono-repo contains two runnable components and local orchestration to tie them together:

- `backend/` — FastAPI backend (Python) providing API endpoints, image caching, and a place to add DB/vector store integrations.
- `webapp/` — Next.js (App Router) React frontend for browsing cards and a first-pass deckbuilder UI.
- `docker-compose.yml` — development compose that wires Postgres, Redis, backend, and frontend for local testing.

Quick overview

- Frontend: Next.js 15 (TypeScript), React 18, Tailwind CSS, Mantine UI.
- Backend: FastAPI, Pydantic, async database init (placeholder), simple image proxy and health endpoints.

Running locally (recommended)

1. Start everything with Docker Compose (hot reload for frontend + backend auto-reload):

  ```bash
  docker compose up --build
  ```

  The frontend service now mounts the local `webapp/` directory into the container and keeps an internal `node_modules` volume. This enables instant hot reload (React Fast Refresh) while still using a containerized environment consistent across machines.

1. Services (default ports):

- Frontend: <http://localhost:3000>
- Backend (FastAPI): <http://localhost:8000> — OpenAPI/Swagger: `/docs`

Notes

- For quick frontend-only development you can run the Next dev server inside `webapp/`:

  ```bash
  # from repository root
  cd webapp
  npm install
  npm run dev
  ```

- For backend-only development you can run the FastAPI app inside `backend/`:

  ```bash
  # from repository root
  cd backend
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```

Project status

- Minimal prototype with a small set of routes and an in-memory caching pattern; intended as a foundation for adding semantic search, embeddings/vector DB, persisted decks, and richer AI features.

Contributing / Next steps

- Add unit and integration tests (frontend + backend), CI, and improved documentation for environment variables and deployment.
- Integrate an embeddings provider and a vector database to enable semantic card search and AI-driven deck suggestions.
- Introduce a production-optimized frontend image (multi-stage build) distinct from the dev-focused hot reload image now used in `docker compose`.
