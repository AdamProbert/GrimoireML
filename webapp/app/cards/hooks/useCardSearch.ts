"use client";
import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import type { LiteCard } from '../types';

/**
 * Encapsulates all state + side‑effects for the card search experience:
 *  - Natural language prompt parsing (POST /nlq/parse)
 *  - Managing query parts & toggling them on/off
 *  - Executing Scryfall searches (/api/scryfall/cards)
 *  - Infinite scroll pagination via IntersectionObserver
 *
 *  The UI layer can stay lean: form, chips, grid, sentinel.
 */
export function useCardSearch(
  // Start with an empty prompt by default (previously 'low cost goblins')
  initialPrompt = '',
  options?: { scrollRoot?: RefObject<HTMLElement | null> }
) {
  // Natural language prompt entered by user
  const [prompt, setPrompt] = useState(initialPrompt);
  // Effective Scryfall query string derived from active parts (not currently displayed but preserved)
  const [effectiveQuery, setEffectiveQuery] = useState<string>('');

  // Loading + error state
  const [loading, setLoading] = useState(false); // Scryfall search
  const [parsing, setParsing] = useState(false); // NL parse request
  const [error, setError] = useState<string | null>(null);

  // Results + pagination
  const [results, setResults] = useState<LiteCard[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  // Query parts (tokens) produced by the parser
  const [allParts, setAllParts] = useState<string[]>([]);
  const [activeParts, setActiveParts] = useState<string[]>([]); // subset of allParts
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);

  // Sentinel + observer for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Internal helper to fetch a page (initial or next)
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
        setResults((prev) => (opts.append ? [...prev, ...data] : data));
        setNextPage(json.next_page || null);
        setHasMore(!!json.has_more);
      } catch (err: any) {
        setError(err.message || 'Error');
      }
    },
    []
  );

  // Build query string from active parts and trigger search
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
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  // Parse natural language prompt then kick off initial search
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
        setActiveParts(parts); // all enabled by default
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

  // Load next page if available
  const loadNext = useCallback(async () => {
    if (!nextPage || !hasMore || isFetchingNext) return;
    setIsFetchingNext(true);
    await fetchPage({ next: nextPage, append: true });
    setIsFetchingNext(false);
  }, [nextPage, hasMore, fetchPage, isFetchingNext]);

  // Public helper when user toggles parts (chips)
  const updateActiveParts = useCallback(
    (parts: string[]) => {
      setActiveParts(parts);
      void runPartsSearch(parts);
    },
    [runPartsSearch]
  );

  // Wire up IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && hasMore && !isFetchingNext && !loading) {
            void loadNext();
          }
        }
      },
      options?.scrollRoot?.current
        ? {
            root: options.scrollRoot.current,
            rootMargin: '0px 0px 600px 0px',
          }
        : undefined
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetchingNext, loading, loadNext]);

  return {
    // state
    prompt,
    setPrompt,
    effectiveQuery,
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
    // actions
    runParseAndSearch,
    updateActiveParts,
    loadNext,
  } as const;
}
