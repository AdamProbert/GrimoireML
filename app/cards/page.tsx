import CardSearchClient from './search-client';
import { Title, Text } from '@mantine/core';

export const metadata = { title: 'Card Search - GrimoireML' };

export default function CardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Title order={2}>Card Search</Title>
        <Text size="sm" c="dimmed">Type a query to search Scryfall (name, type, oracle text). Cached server-side briefly.</Text>
      </div>
      <CardSearchClient />
    </div>
  );
}
