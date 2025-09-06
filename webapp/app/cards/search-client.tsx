'use client';
import React, { useState } from 'react';
import { TextInput, Loader, Text } from '@mantine/core';
import CardThumb from '../../components/ui/CardThumb';

interface LiteCard {
  id: string;
  name: string;
  image?: string;
  mana_cost?: string;
  type_line?: string;
}

export default function CardSearchClient() {
  const [q, setQ] = useState('lightning bolt');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LiteCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scryfall/cards?q=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={runSearch} className="flex gap-2">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          placeholder="e.g. dragon t:legend"
          className="flex-1"
          styles={{
            input: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
              transition: 'background-color .2s ease, border-color .2s ease',
            },
          }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {loading && <Loader />}
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {results.map((card) => (
          <CardThumb
            key={card.id}
            name={card.name}
            imageUrl={card.image}
            status={card.image ? 'ok' : 'pending'}
          />
        ))}
      </div>
      {!loading && results.length === 0 && (
        <Text size="sm" c="dimmed">
          No results yet. Try a query.
        </Text>
      )}
    </div>
  );
}
