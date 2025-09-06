import { scryfallCache } from './cache';
import {
  PREFETCH_MAX_PAGES,
  PREFETCH_MAX_IMAGES_PER_PAGE,
  PREFETCH_DELAY_MS,
} from './scryfallConfig';

export interface LiteCard {
  id: string;
  name: string;
  image?: string;
  mana_cost?: string;
  type_line?: string;
}

export async function searchCardsRaw(query: string) {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;
  const cached = scryfallCache.get(url);
  if (cached) return cached;

  // Simple uncached request (Next.js caching hints removed for type simplicity at this stage)
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Scryfall error ${res.status}`);
  const json = await res.json();
  // Cache this page by its URL so subsequent requests for the same page (or the
  // next_page URL) can be served from memory.
  scryfallCache.set(url, json);

  // Background prefetch: delegate to helper so logic is reusable and
  // single-responsibility.
  if (json?.has_more && json?.next_page) {
    void prefetchScryfallPages(json.next_page, PREFETCH_MAX_PAGES);
  }

  return json;
}

// Fetch a Scryfall page by its full URL. This mirrors the caching and
// prefetch behaviour of `searchCardsRaw` but takes a URL instead of a query.
export async function fetchPageByUrl(url: string) {
  const cached = scryfallCache.get(url);
  if (cached) return cached;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Scryfall error ${res.status}`);
  const json = await res.json();
  scryfallCache.set(url, json);
  if (json?.has_more && json?.next_page) {
    void prefetchScryfallPages(json.next_page, PREFETCH_MAX_PAGES);
  }
  return json;
}

async function prefetchScryfallPages(nextUrl: string | undefined, depth = 2) {
  if (!nextUrl || depth <= 0) return;
  try {
    // Avoid re-fetching a page already cached
    if (scryfallCache.get(nextUrl)) return;
    const r = await fetch(nextUrl, { cache: 'no-store' });
    if (!r.ok) return;
    const pageJson = await r.json();
    scryfallCache.set(nextUrl, pageJson);

    const backendBase =
      (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:8000';

    const cards = Array.isArray(pageJson?.data)
      ? pageJson.data.slice(0, PREFETCH_MAX_IMAGES_PER_PAGE)
      : [];

    void Promise.allSettled(
      cards.map(async (c: any) => {
        try {
          const imgRes = await fetch(`${backendBase}/images/${c.id}`, { cache: 'no-store' });
          if (imgRes.ok) await imgRes.arrayBuffer();
        } catch (e) {
          // ignore
        }
      })
    );

    if (pageJson?.has_more && pageJson?.next_page) {
      setTimeout(() => void prefetchScryfallPages(pageJson.next_page, depth - 1), PREFETCH_DELAY_MS);
    }
  } catch (err) {
    // swallow background errors
  }
}

export async function searchCardsLite(query: string): Promise<LiteCard[]> {
  const raw = await searchCardsRaw(query);
  if (!raw?.data) return [];
  return raw.data.slice(0, 60).map((c: any) => ({
    id: c.id,
    name: c.name,
    image: `/api/card-image/${c.id}`,
    mana_cost: c.mana_cost,
    type_line: c.type_line,
  }));
}
