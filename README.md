# Grimoire ML

<img align="right" width="33%" src="webapp/assets/gimoire-ml-logo-1000x1000.png">

Grimoire ML is an AI-assisted Magic: The Gathering card discovery and deckbuilding web application.

---
This mono-repo contains four core services, a monitoring stack, plus local orchestration:

- `backend/` — FastAPI backend (Slowly splitting this out into dedicated seperate services)
- `query/` — FastAPI NL→IR→Scryfall query microservice (OpenAI + Redis caching)
- `card-db/` — FastAPI card image proxy with Redis caching and Prometheus metrics
- `webapp/` — Next.js 15 (TypeScript), React 18, Tailwind CSS, Mantine UI
- `monitoring/` — Prometheus metrics and Grafana dashboards configuration
- `docker-compose.yml` — development compose wiring Postgres, Redis, backend, query, frontend, Prometheus, and Grafana

Using just (optional)

If you are on macOS, you can install just via Homebrew and use it to bootstrap your Python environments and dependencies:

```bash
brew install just
```

Then, from the repository root, run:

```bash
just setup
```

This will:

- Create a Python virtual environment in `.venv` if it doesn't already exist
- Activate the virtual environment
- Upgrade `pip`
- Install all Python dependencies from each `requirements.txt` file in the repo

Running locally (recommended)

1. Export required secret (OpenAI for query service):

  ```bash
  export OPENAI_API_KEY=sk-...yourkey...
  ```

1. Start everything with Docker Compose (hot reload for frontend + backend auto-reload):

  ```bash
  docker compose up --build
  ```

  The frontend service now mounts the local `webapp/` directory into the container and keeps an internal `node_modules` volume. This enables instant hot reload (React Fast Refresh) while still using a containerized environment consistent across machines.

1. Services (default ports):

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8000> (Swagger: `/docs`)
 - Query Service: <http://localhost:8080> (Swagger: `/docs`)
 - Card DB Service: <http://localhost:8081> (Swagger: `/docs`)
- Prometheus: <http://localhost:9090>
- Grafana: <http://localhost:3001>

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
