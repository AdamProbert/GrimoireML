export const metadata = { title: 'My Decks (Coming Soon) - GrimoireML' };

import Image from 'next/image';
import cardsIcon from '../../assets/cards-icon.png';

export default function MyDecksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
        My Decks
      </h1>
      <p className="text-white/70 max-w-prose">
        Personal deck management, tagging, version history and AI-assisted upgrades will
        live here.
      </p>
      <div className="flex items-center gap-3 text-sm text-white/50">
        <Image src={cardsIcon} alt="Cards icon" className="w-12 h-12 opacity-80" />
        <span>Coming Soon</span>
      </div>
    </div>
  );
}
