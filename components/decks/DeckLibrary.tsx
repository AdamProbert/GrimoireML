'use client';
import { useState } from 'react';
import { listDecks, addDeck, DeckData } from '../../lib/deckStore';
import Heading from '../Heading';
import { parseDeckList } from '../../lib/decklist';
import { Button, Modal, TextInput, Textarea, Alert, Card, Badge, Group } from '@mantine/core';
import Link from 'next/link';

export default function DeckLibrary() {
  const [items, setItems] = useState<DeckData[]>(() => listDecks());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [rawList, setRawList] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [parsedTotal, setParsedTotal] = useState<number | null>(null);

  function reset() {
    setName('');
    setRawList('');
    setErrors([]);
    setParsedTotal(null);
  }

  function handleParsePreview(value: string) {
    setRawList(value);
    if (!value.trim()) { setErrors([]); setParsedTotal(null); return; }
    const parsed = parseDeckList(value);
    setErrors(parsed.errors);
    setParsedTotal(parsed.total);
  }

  function handleSubmit() {
    const parsed = parseDeckList(rawList);
  addDeck({ name: name || `Untitled Deck ${items.length + 1}`, cards: parsed.cards });
  setItems(listDecks());
    setOpen(false);
    reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
  <Heading level={1} className="text-xl">My Decks</Heading>
        <Button size="sm" color="cyan" onClick={() => setOpen(true)}>New Deck</Button>
      </div>
      {items.length === 0 && (
  <Alert color="cyan" variant="light" title="No Decks Yet">Create your first deck by clicking &quot;New Deck&quot; and optionally paste a card list.</Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(d => (
          <Card key={d.id} withBorder className="panel glow-teal-hover p-4 flex flex-col gap-2 cursor-pointer" component={Link} href={`/decks/${d.id}`}>
            <div className="flex items-center justify-between">
              <Heading level={2} className="text-sm truncate" title={d.name}>{d.name}</Heading>
              <Badge size="xs" variant="outline" color="cyan">{d.cards.reduce((a,c)=>a+c.count,0)}</Badge>
            </div>
            <div className="text-[11px] text-[color:var(--color-text-subtle)] flex flex-wrap gap-1">
              {d.cards.slice(0,6).map(c => (
                <span key={c.name} className="px-1.5 py-0.5 rounded bg-[color:var(--color-bg-sunken)]/60 border border-[color:var(--color-border)] text-[10px]">{c.count} {c.name}</span>
              ))}
              {d.cards.length > 6 && <span className="text-[10px] opacity-70">+{d.cards.length - 6} more</span>}
            </div>
            <div className="mt-auto text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
              {new Date(d.createdAt).toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
      <Modal opened={open} onClose={() => { setOpen(false); reset(); }} title="Create Deck" size="lg">
        <div className="flex flex-col gap-4">
          <TextInput label="Name" placeholder="e.g. Golgari Lands" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <Textarea
            label="Card List (optional)"
            description="Paste lines like '2 Forest' – duplicates will be merged."
            autosize
            minRows={8}
            value={rawList}
            onChange={(e) => handleParsePreview(e.currentTarget.value)}
          />
          {parsedTotal !== null && (
            <Group gap={8}>
              <Badge color="cyan" variant="light">Total: {parsedTotal}</Badge>
              {errors.length > 0 && <Badge color="red" variant="light">Issues: {errors.length}</Badge>}
            </Group>
          )}
          {errors.length > 0 && (
            <Alert color="red" variant="light" title="Parse Warnings">
              <ul className="list-disc ml-5 space-y-1 text-xs">
                {errors.slice(0,5).map(e => <li key={e}>{e}</li>)}
                {errors.length > 5 && <li>...{errors.length - 5} more</li>}
              </ul>
            </Alert>
          )}
          <Button disabled={!!errors.length && rawList.trim().length>0} onClick={handleSubmit} color="cyan">Create Deck</Button>
        </div>
      </Modal>
    </div>
  );
}
