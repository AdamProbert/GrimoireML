'use client';
import React from 'react';
import { Loader, Text } from '@mantine/core';
import CardGrid from '../../components/ui/CardGrid';
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
export default function CardSearchClient() {
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
  } = useCardSearch();

  return (
    <div className="space-y-4">
      <PromptForm
        value={prompt}
        onChange={setPrompt}
        onSubmit={runParseAndSearch}
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

      <CardGrid
        cards={results.map((card) => ({
          name: card.name,
          imageUrl: card.image,
          status: card.image ? 'ok' : 'pending',
        }))}
      />

      {/* sentinel element for infinite scroll */}
      <div ref={sentinelRef} />

      {/* initial search loader */}
      {loading && <Loader color="orange" />}

      {/* skeleton placeholders while fetching next page */}
      {isFetchingNext && (
        <CardGrid
          enableSettings={false}
          cards={Array.from({ length: 6 }).map((_, i) => ({
            name: `skeleton-${i}`,
            status: 'pending' as const,
            previewOnHover: false,
          }))}
        />
      )}

      {/* manual load more fallback / button */}
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
      {!loading && results.length === 0 && (
        <Text size="sm" c="dimmed">
          No results yet. Try a query.
        </Text>
      )}
    </div>
  );
}
