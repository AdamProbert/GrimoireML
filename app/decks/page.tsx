import PromptPanel from '../../components/deck/PromptPanel';
import DeckWorkspace from '../../components/deck/DeckWorkspace';
import DeckSummaryPanel from '../../components/deck/DeckSummaryPanel';
import StatusBar from '../../components/deck/StatusBar';

export const metadata = { title: 'Deck Builder - GrimoireML' };

export default function DecksPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-140px)]">
      <div className="grid flex-1 gap-4" style={{ gridTemplateColumns: '260px 1fr 320px' }}>
        <div className="overflow-hidden"><PromptPanel /></div>
        <div className="overflow-hidden"><DeckWorkspace /></div>
        <div className="overflow-hidden"><DeckSummaryPanel /></div>
      </div>
      <StatusBar />
    </div>
  );
}

