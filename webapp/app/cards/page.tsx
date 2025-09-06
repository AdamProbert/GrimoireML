import CardSearchClient from './search-client';
import { Text } from '@mantine/core';
import Heading from '../../components/Heading';

export const metadata = { title: 'Card Search - GrimoireML' };

export default function CardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading level={1} className="text-xl">
          Card Search
        </Heading>
        {/* Right-side action slot (mirrors My Decks toolbar layout) */}
      </div>
      <Text size="sm" c="dimmed" className="max-w-prose">
        Type a query to search Scryfall (name, type, oracle text). Cached server-side
        briefly.
      </Text>
      <CardSearchClient />
    </div>
  );
}
