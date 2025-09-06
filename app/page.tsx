import Link from 'next/link';
import { Text } from '@mantine/core';
import Heading from '../components/Heading';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
  <Heading level={1} className="!text-5xl font-bold">GrimoireML</Heading>
        <Text size="lg" c="dimmed">
          Explore Magic: The Gathering cards with semantic search & AI-assisted deckbuilding.
        </Text>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/cards" className="btn btn-primary btn-lg">Browse Cards</Link>
          <Link href="/my-decks" className="btn btn-primary btn-lg">My Decks</Link>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 p-4 backdrop-blur bg-white/5">
          <Heading level={3} className="mb-2">Fast Card Search</Heading>
          <p className="text-sm text-white/70">Start with a simple name query; evolve to semantic intent like “whimsical fae that draw cards”.</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 backdrop-blur bg-white/5">
          <Heading level={3} className="mb-2">Deck Insights</Heading>
          <p className="text-sm text-white/70">Planned features: curve analysis, synergy detection, upgrade suggestions.</p>
        </div>
        <div className="rounded-lg border border-white/10 p-4 backdrop-blur bg-white/5">
          <Heading level={3} className="mb-2">AI Roadmap</Heading>
          <p className="text-sm text-white/70">Future vector search & recommendations—foundation-ready architecture today.</p>
        </div>
      </section>
    </div>
  );
}
