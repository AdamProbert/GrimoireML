import { scryfallCache } from './cache';

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
  scryfallCache.set(url, json);
  return json;
}

export async function searchCardsLite(query: string): Promise<LiteCard[]> {
  const raw = await searchCardsRaw(query);
  if (!raw?.data) return [];
  return raw.data.slice(0, 60).map((c: any) => ({
    id: c.id,
    name: c.name,
    image:
      c.image_uris?.normal ||
      c.image_uris?.small ||
      c.image_uris?.png ||
      c.card_faces?.[0]?.image_uris?.normal,
    mana_cost: c.mana_cost,
    type_line: c.type_line,
  }));
}
