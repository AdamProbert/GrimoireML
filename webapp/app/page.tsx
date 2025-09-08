'use client';
import { Text } from '@mantine/core';
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
      <div
        className={`flex flex-col items-center w-full transition-all duration-500 ease-out ${
          hasSearched ? 'pt-4 gap-4' : 'justify-center flex-grow py-12'
        }`}
        style={{ minHeight: '70vh' }}
      >
        <div
          className={`flex justify-center w-full transition-all duration-500 ease-out ${
            hasSearched ? 'mb-2' : 'mb-8'
          }`}
        >
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
            className={`h-auto drop-shadow-[0_0_16px_rgba(255,190,120,0.35)] transition-all duration-500 ease-out w-full ${
              hasSearched
                ? 'max-w-[300px] cursor-pointer'
                : 'max-w-[640px] cursor-pointer'
            } outline-none focus:ring-2 focus:ring-amber-400/60 rounded-md`}
          />
        </div>
        <div
          className={`w-full mx-auto transition-all duration-500 ease-out ${
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
