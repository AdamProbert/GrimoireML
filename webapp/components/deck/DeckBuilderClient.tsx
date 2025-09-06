'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getDeck, DeckData } from '../../lib/deckStore';
import Heading from '../Heading';
import { Loader, Alert } from '@mantine/core';
import DeleteDeckControl from './DeleteDeckControl';
import DeckListItem from './DeckListItem';
import CardThumb from '../ui/CardThumb';

interface CardImageInfo {
  name: string;
  count: number;
  image: string | null;
  status: 'pending' | 'ok' | 'error';
  error?: string;
}

interface Props {
  deckId: string;
}

const fetchCard = async (name: string) => {
  const baseName = name.split('//')[0].trim();
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
    baseName
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Scryfall ${res.status}`);
  const json = await res.json();
  const img =
    json.image_uris?.normal ||
    json.image_uris?.large ||
    json.image_uris?.small ||
    json.card_faces?.[0]?.image_uris?.normal ||
    null;
  return img as string | null;
};

export default function DeckBuilderClient({ deckId }: Props) {
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [cards, setCards] = useState<CardImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const idNum = Number(deckId);
      if (Number.isNaN(idNum)) {
        setLoading(false);
        return;
      }
      const d = await getDeck(idNum);
      if (d) {
        setDeck(d);
        const initial: CardImageInfo[] = d.cards.map((c) => ({
          name: c.name,
          count: c.count,
          image: null,
          status: 'pending',
        }));
        setCards(initial);
        setProgress({ done: 0, total: initial.length });
      }
      setLoading(false);
    })();
  }, [deckId]);

  const loadImages = useCallback(async () => {
    if (!deck) return;
    const concurrency = 5;
    let index = 0;
    let done = 0;
    const next = async () => {
      const i = index++;
      if (i >= deck.cards.length) return;
      const card = deck.cards[i];
      try {
        const img = await fetchCard(card.name);
        setCards((prev) =>
          prev.map((p) => (p.name === card.name ? { ...p, image: img, status: 'ok' } : p))
        );
      } catch (e: any) {
        setCards((prev) =>
          prev.map((p) =>
            p.name === card.name ? { ...p, status: 'error', error: e.message } : p
          )
        );
      } finally {
        done += 1;
        setProgress({ done, total: deck.cards.length });
        await next();
      }
    };
    await Promise.all(Array.from({ length: concurrency }).map(() => next()));
  }, [deck]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-sm">
        <Loader size="sm" /> Loading deck...
      </div>
    );
  if (!deck)
    return (
      <Alert color="red" title="Deck Not Found" variant="light">
        Could not locate that deck in the current session. Return to{' '}
        <a className="underline" href="/my-decks">
          My Decks
        </a>{' '}
        and re-open.
      </Alert>
    );

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-140px)]">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Heading level={1} className="text-xl mb-1">
            {deck.name}
          </Heading>
          <div className="flex items-center gap-3 text-[11px] text-[color:var(--color-text-subtle)]">
            <span>{deck.cards.reduce((a, c) => a + c.count, 0)} cards</span>
            <span>|</span>
            <span>
              Loaded {progress.done}/{progress.total}
            </span>
            {progress.done < progress.total && <Loader size="xs" />}
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/my-decks" className="btn btn-outline btn-sm">
            Back
          </a>
          {deck && <DeleteDeckControl deckId={deck.id} deckName={deck.name} />}
          <button className="btn btn-primary btn-sm" disabled>
            Save
          </button>
        </div>
      </div>
      <div className="grid gap-6" style={{ gridTemplateColumns: '260px 1fr 320px' }}>
        <div className="panel p-3 h-[70vh] overflow-y-auto scroll-y">
          <Heading level={3} className="text-sm mb-2">
            Deck List
          </Heading>
          <ul className="space-y-1">
            {deck.cards.map((c) => {
              const st = cards.find((ci) => ci.name === c.name)?.status;
              return (
                <DeckListItem key={c.name} name={c.name} count={c.count} status={st} />
              );
            })}
          </ul>
        </div>
        <div className="panel p-4 h-[70vh] overflow-y-auto scroll-y">
          <Heading level={3} className="text-sm mb-3">
            Cards
          </Heading>
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
            {cards.map((card) => (
              <CardThumb
                key={card.name}
                name={card.name}
                imageUrl={card.image}
                count={deck.cards.find((c) => c.name === card.name)?.count}
                status={card.status}
              />
            ))}
          </div>
        </div>
        <div className="panel p-4 h-[70vh] overflow-y-auto scroll-y flex flex-col gap-4">
          <Heading level={3} className="text-sm">
            Planned Panels
          </Heading>
          <p className="text-xs text-[color:var(--color-text-subtle)]">
            Future: AI suggestions, rationale, curve metrics, tag editing.
          </p>
        </div>
      </div>
    </div>
  );
}
