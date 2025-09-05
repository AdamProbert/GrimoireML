'use client';
import React, { useState } from 'react';
import { TextInput, Button, Group, Loader, SimpleGrid, Card, Image, Text } from '@mantine/core';

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
        <TextInput value={q} onChange={(e) => setQ(e.currentTarget.value)} placeholder="e.g. dragon t:legend" className="flex-1" />
        <Button type="submit" disabled={loading}>Search</Button>
      </form>
      {loading && <Loader />}
      {error && <Text c="red" size="sm">{error}</Text>}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
        {results.map(card => (
          <Card key={card.id} radius="md" padding="xs" withBorder className="bg-white/5 border-white/10">
            {card.image && (
              <Image src={card.image} alt={card.name} radius="sm" h={180} fit="cover" />
            )}
            <Text fw={600} size="sm" mt="xs">{card.name}</Text>
            {card.mana_cost && <Text size="xs" c="dimmed">{card.mana_cost}</Text>}
            {card.type_line && <Text size="xs" c="dimmed" lineClamp={2}>{card.type_line}</Text>}
          </Card>
        ))}
      </SimpleGrid>
      {!loading && results.length === 0 && (
        <Text size="sm" c="dimmed">No results yet. Try a query.</Text>
      )}
    </div>
  );
}
