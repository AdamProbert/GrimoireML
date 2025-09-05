import DeckBuilderClient from '../../../components/deck/DeckBuilderClient';

export const metadata = { title: 'Deck - GrimoireML' };

// Using async Page with params as a Promise to satisfy current Next.js PageProps constraint.
// When Next updates stable types, this can be simplified back to a synchronous object if allowed.
interface RouteParams { id: string; }
interface PageProps { params: Promise<RouteParams>; }

export default async function DeckByIdPage({ params }: PageProps) {
  const { id } = await params;
  return <DeckBuilderClient deckId={id} />;
}
