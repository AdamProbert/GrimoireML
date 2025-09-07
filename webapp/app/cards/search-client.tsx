'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TextInput, Loader, Text, Chip } from '@mantine/core';
import CardGrid from '../../components/ui/CardGrid';

interface LiteCard {
  id: string;
  name: string;
  image?: string;
  mana_cost?: string;
  type_line?: string;
}

export default function CardSearchClient() {
  // Natural language prompt
  const [prompt, setPrompt] = useState('low cost goblins');
  // Effective Scryfall query currently in use (joined active parts)
  const [effectiveQuery, setEffectiveQuery] = useState<string>('lightning bolt');
  // Loading states
  const [loading, setLoading] = useState(false); // Scryfall search loading
  const [parsing, setParsing] = useState(false); // NL parsing loading
  const [results, setResults] = useState<LiteCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  // Parsed parts
  const [allParts, setAllParts] = useState<string[]>([]);
  const [activeParts, setActiveParts] = useState<string[]>([]); // subset of allParts currently enabled
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);

  // helper to fetch a page (either initial q or next_page)
  const fetchPage = useCallback(
    async (opts: { q?: string; next?: string; append?: boolean }) => {
      try {
        const params = new URLSearchParams();
        if (opts.next) params.set('next', opts.next);
        else if (opts.q) params.set('q', opts.q);
        const res = await fetch(`/api/scryfall/cards?${params.toString()}`);
        if (!res.ok) throw new Error('Querying scryfall failed', { cause: res.status });
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

  // Helper: recompute effective query string from active parts & perform search
  const runPartsSearch = useCallback(
    async (parts: string[]) => {
      const q = parts.join(' ').trim();
      setEffectiveQuery(q);
      if (!q) {
        setResults([]);
        setHasMore(false);
        setNextPage(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await fetchPage({ q, append: false });
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );
  // Parse natural language prompt -> query parts, then run initial Scryfall search
  const runParseAndSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!prompt.trim()) return;
      setParsing(true);
      setError(null);
      setParseWarnings([]);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_QUERY_API_URL || 'http://localhost:8080';
        const resp = await fetch(`${baseUrl}/nlq/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: prompt.trim() }),
        });
        if (!resp.ok) throw new Error(`Parse failed (${resp.status})`);
        const json = await resp.json();
        const parts: string[] = json.query_parts || [];
        setAllParts(parts);
        setActiveParts(parts); // all on by default
        setParseWarnings(json.warnings || []);
        await runPartsSearch(parts);
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally {
        setParsing(false);
      }
    },
    [prompt, runPartsSearch]
  );

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
      <form onSubmit={runParseAndSearch} className="flex gap-2 items-start">
        <TextInput
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          placeholder="e.g. cheap blue or green human creatures under 3 mana sorted by cost"
          className="flex-1"
          variant="filled"
          radius="sm"
          size="md"
          styles={{
            input: {
              background: 'linear-gradient(135deg,#1f1a17 0%, #241810 100%)',
              color: 'var(--color-text-primary)',
              border: '1px solid rgba(255,140,0,0.35)',
              boxShadow:
                '0 0 0 1px rgba(255,120,0,0.25), 0 0 8px -2px rgba(255,90,0,0.4) inset',
              transition:
                'border-color .18s ease, box-shadow .18s ease, background .25s ease',
            },
            wrapper: { position: 'relative' },
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 1px rgba(255,160,0,0.55), 0 0 10px 0 rgba(255,90,0,0.6) inset';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 0 1px rgba(255,120,0,0.25), 0 0 8px -2px rgba(255,90,0,0.4) inset';
          }}
        />
        <button
          type="submit"
          disabled={parsing || loading}
          className="btn btn-primary whitespace-nowrap"
        >
          {parsing ? 'Parsing…' : 'Parse & Search'}
        </button>
      </form>
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
      {allParts.length > 0 && (
        <div className="space-y-2">
          <Text size="sm" c="dimmed">
            Query parts (toggle to refine):
          </Text>
          <Chip.Group
            multiple
            value={activeParts}
            onChange={(vals) => {
              setActiveParts(vals as string[]);
              void runPartsSearch(vals as string[]);
            }}
          >
            <div className="flex flex-wrap gap-2">
              {allParts.map((p) => (
                <Chip
                  key={p}
                  value={p}
                  variant="filled"
                  radius="sm"
                  color={activeParts.includes(p) ? 'orange' : 'gray'}
                  styles={{
                    root: {
                      background: activeParts.includes(p)
                        ? 'linear-gradient(135deg,#ff7a18 0%,#ff521b 40%,#ff2d55 100%)'
                        : 'rgba(120,120,120,0.15)',
                      color: activeParts.includes(p) ? '#fff' : '#ddd',
                      border: activeParts.includes(p)
                        ? '1px solid rgba(255,140,0,0.65)'
                        : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: activeParts.includes(p)
                        ? '0 0 6px -1px rgba(255,100,0,0.7)'
                        : 'none',
                      cursor: 'pointer',
                      transition: 'all .18s ease',
                    },
                    checkIcon: { color: '#fff' },
                  }}
                >
                  {p}
                </Chip>
              ))}
            </div>
          </Chip.Group>
        </div>
      )}
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
