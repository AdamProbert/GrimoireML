import CardSearchClient from './search-client';
import { Text } from '@mantine/core';
import Heading from '../../components/Heading';

export const metadata = { title: 'Card Search - GrimoireML' };

export default function CardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Heading
          level={1}
          className="text-xl font-semibold bg-gradient-to-r from-orange-400 via-amber-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(255,140,0,0.35)]"
        >
          Card Search
        </Heading>
        {/* Right-side action slot (mirrors My Decks toolbar layout) */}
      </div>
      <Text
        size="sm"
        className="max-w-prose text-amber-200/80 [&>strong]:text-amber-300"
        style={{ textShadow: '0 0 3px rgba(0,0,0,0.25)' }}
      >
        {' '}
        Try a short prompt like "low cost goblins" or "legendary artefacts that give
        protection" we'll go search Scryfall.
      </Text>
      <CardSearchClient />
    </div>
  );
}
