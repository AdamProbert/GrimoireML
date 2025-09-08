'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Text } from '@mantine/core';
import { useCardSearch } from './hooks/useCardSearch';
import PromptForm from './components/PromptForm';
import QueryPartsChips from './components/QueryPartsChips';
import SearchFeedback from './components/SearchFeedback';
import ResultsSection from './components/ResultsSection';
import { useDelayedBusy } from './hooks/useDelayedBusy';

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
  const [executedPrompt, setExecutedPrompt] = useState('');
  const dirty = prompt !== executedPrompt;

  // Whenever prompt diverges from last executed prompt -> immediate clean reset
  useEffect(() => {
    if (dirty) {
      if (displayCards.length) setDisplayCards([]);
      clearDerived();
      if (scrollRootRef.current) scrollRootRef.current.scrollTop = 0;
    }
  }, [dirty, displayCards.length, clearDerived]);

  // When new results arrive and input not dirty, sync them
  useEffect(() => {
    if (!dirty) {
      setDisplayCards(results);
    }
  }, [results, dirty]);

  // Track only if first search happened for callback side-effect
  const firstSearchPerformedRef = useRef(false);
  const activeBusy = parsing || loading;
  const loaderActive = useDelayedBusy(
    firstSearchPerformedRef.current && activeBusy,
    1000
  );

  // Reset handler (listens for global reset event dispatched by NavBar/Logo)
  useEffect(() => {
    const handler = () => {
      firstSearchPerformedRef.current = false;
      setDisplayCards([]);
      resetAll();
      setExecutedPrompt('');
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
    setExecutedPrompt(prompt); // freeze current prompt as executed
    await runParseAndSearch();
  };

  return (
    <div className="flex flex-col flex-1 gap-4 min-h-0">
      <PromptForm
        value={prompt}
        onChange={(v) => {
          setPrompt(v);
        }}
        onSubmit={handleSubmit}
        disabled={activeBusy || loaderActive}
      />
      <SearchFeedback error={error} warnings={parseWarnings} />

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

      <ResultsSection
        cards={displayCards}
        dirty={dirty}
        loaderActive={loaderActive}
        show={loaderActive || activeBusy || (!dirty && displayCards.length > 0)}
        hasMore={hasMore}
        isFetchingNext={isFetchingNext}
        onLoadMore={() => void loadNext()}
        sentinelRef={sentinelRef}
        scrollRef={scrollRootRef}
      />
    </div>
  );
}
