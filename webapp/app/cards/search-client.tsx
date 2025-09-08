'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Text } from '@mantine/core';
import CardGrid from '../../components/ui/CardGrid';
import ArcaneLoader from '../../components/ArcaneLoader';
import { useCardSearch } from './hooks/useCardSearch';
import PromptForm from './components/PromptForm';
import QueryPartsChips from './components/QueryPartsChips';

/**
 * CardSearchClient orchestrates small focused parts:
 *  - useCardSearch hook: all logic & state
 *  - PromptForm: input + submit
 *  - QueryPartsChips: toggleable parsed query tokens
 *  - CardGrid: existing UI for displaying card thumbs
 */
interface CardSearchClientProps {
  onFirstSearch?: () => void;
}

export default function CardSearchClient({ onFirstSearch }: CardSearchClientProps) {
  // Scroll root is the grid area which should flex to fill remaining vertical space
  const scrollRootRef = useRef<HTMLDivElement | null>(null);
  const {
    prompt,
    setPrompt,
    loading,
    parsing,
    results,
    error,
    hasMore,
    isFetchingNext,
    allParts,
    activeParts,
    parseWarnings,
    sentinelRef,
    runParseAndSearch,
    updateActiveParts,
    loadNext,
    clearDerived,
    resetAll,
  } = useCardSearch(undefined, { scrollRoot: scrollRootRef });

  // Shadow copy of last committed search results (cleared immediately on edit)
  const [displayCards, setDisplayCards] = useState<typeof results>([]);
  const lastSearchPromptRef = useRef('');
  const [dirty, setDirty] = useState(false);

  // Whenever prompt diverges from last executed prompt -> immediate clean reset
  useEffect(() => {
    const isDirty = prompt !== lastSearchPromptRef.current;
    if (isDirty) {
      if (displayCards.length) setDisplayCards([]);
      clearDerived(); // purge parts + warnings + results
      if (scrollRootRef.current) scrollRootRef.current.scrollTop = 0;
    }
    setDirty(isDirty);
  }, [prompt, displayCards.length, clearDerived]);

  // When new results arrive and input not dirty, sync them
  useEffect(() => {
    if (!dirty) {
      setDisplayCards(results);
    }
  }, [results, dirty]);

  // Track only if first search happened for callback side-effect
  const firstSearchPerformedRef = useRef(false);
  const [loaderActive, setLoaderActive] = useState(false);
  const loaderStartRef = useRef<number>(0);
  const loaderTimerRef = useRef<number | null>(null);
  const MIN_LOADER_MS = 1000; // minimum time arcane loader remains visible each search (reduced from 3000)
  const loadingRef = useRef(loading);
  const parsingRef = useRef(parsing);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    parsingRef.current = parsing;
  }, [parsing]);

  // Reset handler (listens for global reset event dispatched by NavBar/Logo)
  useEffect(() => {
    const handler = () => {
      firstSearchPerformedRef.current = false;
      setDisplayCards([]);
      resetAll();
      lastSearchPromptRef.current = '';
      setDirty(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('grimoire:reset-search', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('grimoire:reset-search', handler);
      }
    };
  }, [resetAll]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!prompt.trim()) {
      return;
    }
    if (!firstSearchPerformedRef.current) {
      firstSearchPerformedRef.current = true;
      onFirstSearch?.();
    }
    // Start loader every search
    setLoaderActive(true);
    loaderStartRef.current = Date.now();
    if (loaderTimerRef.current) window.clearTimeout(loaderTimerRef.current);
    loaderTimerRef.current = window.setTimeout(() => {
      // Only clear if backend work done
      if (!loadingRef.current && !parsingRef.current) {
        setLoaderActive(false);
      }
    }, MIN_LOADER_MS);
    // Reset dirty state and record executed prompt BEFORE running search
    lastSearchPromptRef.current = prompt;
    setDirty(false);
    await runParseAndSearch();
  };

  // When loading/parsing complete, if min loader time already elapsed, hide loader
  useEffect(() => {
    if (loaderActive && !loading && !parsing) {
      const elapsed = Date.now() - loaderStartRef.current;
      if (elapsed >= MIN_LOADER_MS) {
        setLoaderActive(false);
      }
      // else let timeout clear it
    }
  }, [loading, parsing, loaderActive]);

  return (
    <div className="flex flex-col flex-1 gap-4 min-h-0">
      <PromptForm
        value={prompt}
        onChange={(v) => {
          setPrompt(v);
        }}
        onSubmit={handleSubmit}
        disabled={parsing || loading || loaderActive}
      />

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      {parseWarnings.length > 0 && (
        <Text size="xs" c="orange">
          Warnings: {parseWarnings.join(', ')}
        </Text>
      )}

      {/* Chips area (flex-shrink) */}
      {!loaderActive && !dirty && (
        <div className="flex-shrink-0">
          <QueryPartsChips
            allParts={allParts}
            activeParts={activeParts}
            onChange={updateActiveParts}
          />
        </div>
      )}

      {(() => {
        const showGrid =
          loaderActive || loading || parsing || (!dirty && displayCards.length > 0);
        if (!showGrid) return null;
        return (
          <div
            ref={scrollRootRef}
            className={[
              'grim-grid-wrapper flex-1 min-h-0 relative border border-white/15 rounded-md',
              'bg-black/50 backdrop-blur-sm mx-auto w-full overflow-y-auto p-3',
            ].join(' ')}
          >
            {loaderActive && <ArcaneLoader fullscreen={false} />}
            {!loaderActive && !dirty && displayCards.length > 0 && (
              <CardGrid
                initialMinWidth={200}
                cards={displayCards.map((card) => ({
                  name: card.name,
                  imageUrl: card.image,
                  status: card.image ? 'ok' : 'pending',
                }))}
              />
            )}
            {hasMore && !isFetchingNext && (
              <div className="flex justify-center py-4">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    void loadNext();
                  }}
                  aria-label="Load more results"
                >
                  Load more
                </button>
              </div>
            )}
            <div ref={sentinelRef} />
          </div>
        );
      })()}

      {/* Local scrollbar styling */}
      <style jsx>{`
        .grim-grid-wrapper {
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .grim-grid-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .grim-grid-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
