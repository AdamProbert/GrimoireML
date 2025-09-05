export interface DeckCard { name: string; count: number; }
export interface DeckData { id: string; name: string; createdAt: number; cards: DeckCard[]; }

// Simple in-memory module store (ephemeral, reset on reload)
const decks: DeckData[] = [];

export function listDecks(): DeckData[] { return decks.slice().sort((a,b)=>b.createdAt - a.createdAt); }
export function addDeck(deck: Omit<DeckData, 'id' | 'createdAt'>): DeckData {
  const data: DeckData = { id: crypto.randomUUID(), createdAt: Date.now(), ...deck };
  decks.push(data);
  return data;
}

export function getDeck(id: string): DeckData | undefined { return decks.find(d => d.id === id); }
