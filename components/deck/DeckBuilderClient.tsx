"use client";
import { useEffect, useState, useCallback } from 'react';
import { getDeck, DeckData } from '../../lib/deckStore';
import { Loader, Alert, Badge, Button } from '@mantine/core';

interface CardImageInfo {
  name: string;
  count: number;
  image: string | null;
  status: 'pending' | 'ok' | 'error';
  error?: string;
}

interface Props { deckId: string; }

const fetchCard = async (name: string) => {
  const baseName = name.split('//')[0].trim();
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(baseName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Scryfall ${res.status}`);
  const json = await res.json();
  const img = json.image_uris?.normal || json.image_uris?.large || json.image_uris?.small || json.card_faces?.[0]?.image_uris?.normal || null;
  return img as string | null;
};

export default function DeckBuilderClient({ deckId }: Props) {
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [cards, setCards] = useState<CardImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    const d = getDeck(deckId);
    if (d) {
      setDeck(d);
      const initial: CardImageInfo[] = d.cards.map(c => ({ name: c.name, count: c.count, image: null, status: 'pending' }));
      setCards(initial);
      setProgress({ done: 0, total: initial.length });
    }
    setLoading(false);
  }, [deckId]);

  const loadImages = useCallback(async () => {
    if (!deck) return;
    const concurrency = 5;
    let index = 0; let done = 0;
    const next = async () => {
      const i = index++;
      if (i >= deck.cards.length) return;
      const card = deck.cards[i];
      try {
        const img = await fetchCard(card.name);
        setCards(prev => prev.map(p => p.name === card.name ? { ...p, image: img, status: 'ok' } : p));
      } catch (e: any) {
        setCards(prev => prev.map(p => p.name === card.name ? { ...p, status: 'error', error: e.message } : p));
      } finally {
        done += 1; setProgress({ done, total: deck.cards.length });
        await next();
      }
    };
    await Promise.all(Array.from({ length: concurrency }).map(() => next()));
  }, [deck]);

  useEffect(() => { loadImages(); }, [loadImages]);

  if (loading) return <div className="flex items-center gap-2 text-sm"><Loader size="sm" /> Loading deck...</div>;
  if (!deck) return <Alert color="red" title="Deck Not Found" variant="light">Could not locate that deck in the current session. Return to <a className="underline" href="/my-decks">My Decks</a> and re-open.</Alert>;

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-140px)]">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold mb-1">{deck.name}</h1>
          <div className="flex items-center gap-3 text-[11px] text-[color:var(--color-text-subtle)]">
            <span>{deck.cards.reduce((a,c)=>a+c.count,0)} cards</span>
            <span>|</span>
            <span>Loaded {progress.done}/{progress.total}</span>
            {progress.done < progress.total && <Loader size="xs" />}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="xs" variant="default" component="a" href="/my-decks">Back</Button>
          <Button size="xs" color="cyan" variant="light" disabled>Save</Button>
        </div>
      </div>
      <div className="grid gap-6" style={{ gridTemplateColumns: '260px 1fr 320px' }}>
        <div className="panel p-3 h-[70vh] overflow-y-auto scroll-y">
          <h3 className="text-sm font-semibold mb-2 text-gradient-brand">Deck List</h3>
          <ul className="space-y-1 text-xs">
            {deck.cards.map(c => (
              <li key={c.name} className="flex items-center justify-between gap-2">
                <span className="truncate"><span className="text-[color:var(--color-accent-teal)]">{c.count}×</span> {c.name}</span>
                <Badge size="xs" variant="outline" color="cyan">{cards.find(ci=>ci.name===c.name)?.status === 'ok' ? '✓' : cards.find(ci=>ci.name===c.name)?.status === 'error' ? '!' : '…'}</Badge>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-4 h-[70vh] overflow-y-auto scroll-y">
          <h3 className="text-sm font-semibold mb-3 text-gradient-brand">Cards</h3>
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
            {cards.map(card => (
              <div key={card.name} className="relative group rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-sunken)] overflow-hidden hover:glow-teal-hover">
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.image} alt={card.name} className="w-full h-auto block" loading="lazy" />
                ) : (
                  <div className="flex items-center justify-center h-48 text-[10px] text-[color:var(--color-text-subtle)]">
                    {card.status === 'error' ? 'Error' : 'Loading...'}
                  </div>
                )}
                <div className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px]">{card.count}×</div>
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-[10px] line-clamp-2">
                  {card.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-4 h-[70vh] overflow-y-auto scroll-y flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gradient-brand">Planned Panels</h3>
          <p className="text-xs text-[color:var(--color-text-subtle)]">Future: AI suggestions, rationale, curve metrics, tag editing.</p>
        </div>
      </div>
    </div>
  );
}
