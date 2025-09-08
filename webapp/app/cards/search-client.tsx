'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader, Text } from '@mantine/core';
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
  } = useCardSearch(undefined, { scrollRoot: scrollRootRef });

  // Track whether any search has been initiated (state so we re-render immediately)
  const [activated, setActivated] = useState(false);
  const firstSearchPerformedRef = useRef(false);
  const [firstLoaderActive, setFirstLoaderActive] = useState(false);
  const MIN_FIRST_LOADER_MS = 3000; // minimum time arcane loader remains visible on first search

  // Reset handler (listens for global reset event dispatched by NavBar/Logo)
  useEffect(() => {
    const handler = () => {
      firstSearchPerformedRef.current = false;
      setActivated(false);
      setPrompt('');
      // Optional: could also clear results via a hook method if exposed in future
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('grimoire:reset-search', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('grimoire:reset-search', handler);
      }
    };
  }, [setPrompt]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!firstSearchPerformedRef.current) {
      firstSearchPerformedRef.current = true; // persist flag
      setActivated(true); // trigger UI transition (show grid)
      onFirstSearch?.();
      // Start guaranteed arcane loader window
      setFirstLoaderActive(true);
      setTimeout(() => {
        setFirstLoaderActive(false);
      }, MIN_FIRST_LOADER_MS);
    }
    await runParseAndSearch();
  };

  return (
    <div className="space-y-4">
      <PromptForm
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disabled={parsing || loading}
      />

      {(loading || parsing) && <Loader color="orange" />}
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

      <QueryPartsChips
        allParts={allParts}
        activeParts={activeParts}
        onChange={updateActiveParts}
      />

      {/* Grid area (appears after first submit even while loading) */}
      {activated && (
        <div
          ref={scrollRootRef}
          className="relative border border-white/10 rounded-md bg-black/10 backdrop-blur-sm mx-auto animate-fade-in"
          style={
            {
              maxWidth: '100%',
              width: '100%',
              height: 'min(70vh, 1000px)',
              overflowY: 'auto',
              padding: '1rem',
            } as React.CSSProperties
          }
        >
          {/* First search arcane loader overlay */}
          {firstSearchPerformedRef.current && firstLoaderActive && (
            <ArcaneLoader label="Consulting the grimoire…" />
          )}
          {/* After loader completes, show results (when available) */}
          {!firstLoaderActive && results.length > 0 && (
            <CardGrid
              className="animate-fade-in"
              initialMinWidth={170}
              cards={results.map((card) => ({
                name: card.name,
                imageUrl: card.image,
                status: card.image ? 'ok' : 'pending',
              }))}
            />
          )}
          <div ref={sentinelRef} />
        </div>
      )}

      {loading && <Loader color="orange" />}

      {isFetchingNext && (
        <div className="mt-2 animate-fade-in-slow">
          <CardGrid
            enableSettings={false}
            cards={Array.from({ length: 6 }).map((_, i) => ({
              name: `skeleton-${i}`,
              status: 'pending' as const,
              previewOnHover: false,
            }))}
          />
        </div>
      )}

      {hasMore && !isFetchingNext && (
        <div className="flex justify-center">
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

      {!loading && !hasMore && results.length > 0 && (
        <Text size="sm" c="dimmed">
          End of results.
        </Text>
      )}
      {!loading && activated && results.length === 0 && (
        <Text size="sm" c="dimmed">
          No results yet. Try a query.
        </Text>
      )}
    </div>
  );
}
