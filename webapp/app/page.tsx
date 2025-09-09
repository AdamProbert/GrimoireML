'use client';
import CardSearchClient from './cards/search-client';
import Hero from '../components/Hero';
import Image from 'next/image';
import titleImage from '../assets/grimoire-title-1kx1k.png';
import { useState, useEffect, useCallback } from 'react';

export default function HomePage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [resetCounter, setResetCounter] = useState(0); // forces remount of search client

  const doReset = useCallback(() => {
    setHasSearched(false);
    setResetCounter((c) => c + 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grimoire:reset-search'));
    }
  }, []);

  // Listen for external reset events (e.g., NavBar logo click)
  useEffect(() => {
    const handler = () => doReset();
    if (typeof window !== 'undefined') {
      window.addEventListener('grimoire:reset-search', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('grimoire:reset-search', handler);
      }
    };
  }, [doReset]);

  return (
    <Hero hideDefaultHeader>
      {/* Two layout states only: pre-search (centered) and searched/searching (title fixed near top) */}
      <div
        className={`flex flex-col items-center w-full min-h-[65vh] transition-[padding] duration-300 ease-out ${
          hasSearched ? 'pt-4 gap-4' : 'justify-center py-12'
        }`}
      >
        <div className={`flex justify-center w-full ${hasSearched ? 'mb-2' : 'mb-6'}`}>
          <Image
            src={titleImage}
            alt="GrimoireML Title"
            priority
            onClick={doReset}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                doReset();
              }
            }}
            className={`h-auto drop-shadow-[0_0_20px_rgba(255,190,120,0.4)] transition-all duration-300 ease-out w-full ${
              hasSearched ? 'max-w-[360px]' : 'max-w-[768px]'
            } cursor-pointer outline-none focus:ring-2 focus:ring-amber-400/60 rounded-md`}
          />
        </div>
        <div
          className={`w-full mx-auto flex-1 flex flex-col transition-[max-width] duration-300 ease-out ${
            hasSearched ? 'max-w-[1600px]' : 'max-w-3xl'
          }`}
        >
          <CardSearchClient
            key={resetCounter}
            onFirstSearch={() => setHasSearched(true)}
          />
        </div>
      </div>
    </Hero>
  );
}
