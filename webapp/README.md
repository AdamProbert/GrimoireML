# GrimoireML Frontend (Next.js)

Frontend UI built with Next.js (App Router), TypeScript, Tailwind CSS and Mantine UI. Provides a lightweight card browsing UI and a nascent deckbuilder experience.

Quick start

Option A: Docker Compose (recommended for consistent dev environment + hot reload)

```bash
docker compose up --build frontend
```

Option B: Local node (no containers)

```bash
cd webapp
npm install
npm run dev
```

Default dev URL: <http://localhost:3000>

Available npm scripts (from `package.json`)

- `dev` — start Next.js in development
- `build` — production build
- `start` — start built app
- `lint` — run Next.js lint

Notable routes/pages

- `/` — landing page
- `/cards` — card search UI (calls local API proxy at `/api/scryfall/cards?q=...`)
- `/decks` — decks listing and workspace UI
- `/my-decks` — personal decks (placeholder)

API routes (server functions in the Next app)

- `GET /api/health` — simple health check
- `GET /api/scryfall/cards?q=...` — proxied Scryfall search that uses an in-memory cache (`lib/scryfall.ts`)

Env / Integration notes

- When running in Docker Compose the frontend expects the backend to be reachable at `http://backend:8000` (set via `NEXT_PUBLIC_API_BASE`).
- For local dev, the webapp proxies to its internal API routes which in turn may call external services (Scryfall).
- The development Dockerfile plus `docker-compose.yml` bind mount `./webapp` into `/app` and keep `node_modules` in an anonymous volume so that hot reload works while avoiding host/OS module churn.

Next steps

- Add frontend tests (Vitest + React Testing Library recommended)
- Improve the deckbuilder UI and persist decks to the backend
- Add authentication and user-scoped deck storage
- Create a production build Dockerfile variant (multi-stage) separate from the current dev-focused image.
