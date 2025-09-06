'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TextInput, Loader, Text } from '@mantine/core';
import CardThumb from '../../components/ui/CardThumb';

interface LiteCard {
  id: string;
  name: string;
  image?: string;
  mana_cost?: string;
  type_line?: string;
}

export default function CardSearchClient() {
  const [q, setQ] = useState('lightning bolt');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LiteCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  // helper to fetch a page (either initial q or next_page)
  const fetchPage = useCallback(
    async (opts: { q?: string; next?: string; append?: boolean }) => {
      try {
        const params = new URLSearchParams();
        if (opts.next) params.set('next', opts.next);
        else if (opts.q) params.set('q', opts.q);
        const res = await fetch(`/api/scryfall/cards?${params.toString()}`);
        if (!res.ok) throw new Error('Search failed');
        const json = await res.json();
        const data: LiteCard[] = json.data || [];
        if (opts.append) {
          setResults((r) => [...r, ...data]);
        } else {
          setResults(data);
        }
        setNextPage(json.next_page || null);
        setHasMore(!!json.has_more);
        return json;
      } catch (err: any) {
        setError(err.message || 'Error');
        return null;
      }
    },
    []
  );

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await fetchPage({ q: q.trim(), append: false });
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  // load next page
  const loadNext = useCallback(async () => {
    if (!nextPage || !hasMore || isFetchingNext) return;
    setIsFetchingNext(true);
    await fetchPage({ next: nextPage, append: true });
    setIsFetchingNext(false);
  }, [nextPage, hasMore, fetchPage, isFetchingNext]);

  // IntersectionObserver to trigger loading more when sentinel is visible
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && hasMore && !isFetchingNext && !loading) {
          void loadNext();
        }
      }
    });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetchingNext, loading, loadNext]);

  return (
    <div className="space-y-4">
      <form onSubmit={runSearch} className="flex gap-2">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          placeholder="e.g. dragon t:legend"
          className="flex-1"
          styles={{
            input: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
              transition: 'background-color .2s ease, border-color .2s ease',
            },
          }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>
      {loading && <Loader />}
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {results.map((card) => (
          <CardThumb
            key={card.id}
            name={card.name}
            imageUrl={card.image}
            status={card.image ? 'ok' : 'pending'}
          />
        ))}
      </div>
      {/* sentinel element for infinite scroll */}
      <div ref={sentinelRef} />
      {/* initial search loader */}
      {loading && <Loader />}
      {/* skeleton placeholders while fetching next page */}
      {isFetchingNext && (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardThumb key={`skeleton-${i}`} name={''} status="pending" />
          ))}
        </div>
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
