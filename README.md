# GrimoireML

Early scaffold for an AI-assisted Magic: The Gathering card discovery & deckbuilding web app.

## Stack

- Next.js 15 (App Router, TypeScript)
- React 18
- Tailwind CSS + custom brand palette
- Mantine UI (dark mode baseline)
- Simple in-memory TTL cache for Scryfall searches

## Quick Start

```bash
npm install
npm run dev
```

Then open: http://localhost:3000

## Implemented Routes

- `/` – landing page
- `/cards` – basic card search (calls proxy API)
- `/decks` – placeholder for future builder
- `/api/health` – health check
- `/api/scryfall/cards?q=QUERY` – cached Scryfall proxy returning a lite card list

## Next Ideas (Not Yet Implemented)

- Testing setup (Vitest + React Testing Library)
- Persistent caching / DB & vector store
- Semantic search embeddings + natural language queries
- Deck builder drag/drop & analytics
- User accounts & saved decks

## Notes

This scaffold purposefully keeps logic minimal while establishing a clean foundation for iterative AI + data features.
