import CardSearchClient from './search-client';
import { Text } from '@mantine/core';
import Heading from '../../components/Heading';

export const metadata = { title: 'Card Search - GrimoireML' };

export default function CardsPage() {
  return (
    <div className="space-y-6">
      <div>
  <Heading level={2}>Card Search</Heading>
        <Text size="sm" c="dimmed">Type a query to search Scryfall (name, type, oracle text). Cached server-side briefly.</Text>
      </div>
      <CardSearchClient />
    </div>
  );
}
