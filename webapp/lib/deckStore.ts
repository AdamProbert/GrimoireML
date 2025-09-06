export interface DeckCard { name: string; count: number }
export interface DeckData { id: number; name: string; created_at: number; cards: (DeckCard & { id: number })[] }

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export async function fetchDecks(): Promise<DeckData[]> {
  const res = await fetch(`${API_BASE}/decks/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load decks');
  return res.json();
}

export async function createDeck(payload: { name: string; cards: DeckCard[] }): Promise<DeckData> {
  const res = await fetch(`${API_BASE}/decks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create deck');
  return res.json();
}

export async function getDeck(id: number): Promise<DeckData | null> {
  const res = await fetch(`${API_BASE}/decks/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch deck');
  return res.json();
}

export async function updateDeck(id: number, payload: { name?: string; cards?: DeckCard[] }): Promise<DeckData> {
  const res = await fetch(`${API_BASE}/decks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update deck');
  return res.json();
}

export async function deleteDeck(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/decks/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete deck');
}
