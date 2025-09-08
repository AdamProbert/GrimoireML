'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import bookIcon from '../assets/book-icon.png';

export default function InteractiveHeader() {
  const router = useRouter();
  const handleReset = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    router.push('/');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grimoire:reset-search'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[color:var(--color-bg-base)]/85 border-b border-[color:var(--color-border)] shadow-[0_2px_0_0_rgba(255,111,0,0.08)]">
      <div className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={handleReset}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleReset(e);
          }}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-md"
          aria-label="GrimoireML Home"
        >
          <Image
            src={bookIcon}
            alt="GrimoireML icon"
            className="w-10 h-10 drop-shadow-[0_0_6px_rgba(255,160,0,0.35)] transition-transform group-hover:scale-[1.05]"
            priority
          />
          <h1 className="text-lg md:text-xl font-semibold tracking-tight bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent group-hover:brightness-110 select-none">
            GrimoireML Card Search
          </h1>
        </button>
      </div>
    </header>
  );
}
