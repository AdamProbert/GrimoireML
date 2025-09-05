import Link from 'next/link';
import { Title, Text, Button, Group } from '@mantine/core';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <Title order={1} className="text-gradient-brand !text-5xl font-bold">GrimoireML</Title>
        <Text size="lg" c="dimmed">
          Explore Magic: The Gathering cards with semantic search & AI-assisted deckbuilding.
        </Text>
        <Group justify="center" mt="md">
          <Button component={Link} href="/cards" size="md" color="brand">Browse Cards</Button>
          <Button component={Link} href="/decks" variant="outline" size="md">Deck Builder</Button>
        </Group>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 p-4 backdrop-blur bg-white/5">
          <h3 className="font-semibold mb-2">Fast Card Search</h3>
          <p className="text-sm text-white/70">Start with a simple name query; evolve to semantic intent like “whimsical fae that draw cards”.</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 backdrop-blur bg-white/5">
          <h3 className="font-semibold mb-2">Deck Insights</h3>
          <p className="text-sm text-white/70">Planned features: curve analysis, synergy detection, upgrade suggestions.</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 backdrop-blur bg-white/5">
          <h3 className="font-semibold mb-2">AI Roadmap</h3>
          <p className="text-sm text-white/70">Future vector search & recommendations—foundation-ready architecture today.</p>
        </div>
      </section>
    </div>
  );
}
