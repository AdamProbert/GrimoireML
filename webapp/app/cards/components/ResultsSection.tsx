'use client';
import React from 'react';
import CardGrid from '../../../components/ui/CardGrid';
import ArcaneLoader from '../../../components/ArcaneLoader';
import ResultsScroller from './ResultsScroller';

export interface ResultsSectionCard {
  name: string;
  image?: string;
}

interface ResultsSectionProps {
  cards: ResultsSectionCard[];
  dirty: boolean;
  loaderActive: boolean;
  show: boolean; // gate rendering of entire section
  hasMore: boolean;
  isFetchingNext: boolean;
  onLoadMore: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Encapsulates the scrollable results area (loader overlay + grid + pagination controls).
 */
export const ResultsSection: React.FC<ResultsSectionProps> = ({
  cards,
  dirty,
  loaderActive,
  show,
  hasMore,
  isFetchingNext,
  onLoadMore,
  sentinelRef,
  scrollRef,
}) => {
  return (
    <ResultsScroller scrollRef={scrollRef} show={show} aria-busy={loaderActive}>
      {loaderActive && <ArcaneLoader fullscreen={false} />}
      {!loaderActive && !dirty && cards.length > 0 && (
        <CardGrid
          initialMinWidth={200}
          cards={cards.map((c) => ({
            name: c.name,
            imageUrl: c.image,
            status: c.image ? 'ok' : 'pending',
          }))}
        />
      )}
      {hasMore && !isFetchingNext && (
        <div className="flex justify-center py-4">
          <button
            className="btn btn-secondary"
            onClick={onLoadMore}
            aria-label="Load more results"
          >
            Load more
          </button>
        </div>
      )}
      <div ref={sentinelRef as React.RefObject<HTMLDivElement>} />
    </ResultsScroller>
  );
};

export default ResultsSection;
