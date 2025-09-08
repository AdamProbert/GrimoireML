export const metadata = { title: 'Deck Builder (Coming Soon) - GrimoireML' };

import Image from 'next/image';
import computerIcon from '../../assets/computer-icon.png';

export default function DecksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
        Deck Builder
      </h1>
      <p className="text-white/70 max-w-prose">
        The interactive deck building workspace is on the way. Soon you'll get curve &
        synergy analysis, AI-assisted suggestions, and more.
      </p>
      <div className="flex items-center gap-3 text-sm text-white/50">
        <Image src={computerIcon} alt="Work in progress" className="w-12 h-12 opacity-80" />
        <span>Coming Soon</span>
      </div>
    </div>
  );
}
