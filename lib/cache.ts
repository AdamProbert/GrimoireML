// Simple in-memory TTL cache with a max size (naive LRU-ish eviction)
export interface CacheOptions {
  ttlMs: number;
  maxEntries: number;
}

interface Entry<V> {
  value: V;
  expires: number;
  last: number; // last access timestamp
}

export class TTLCache<K, V> {
  private store = new Map<K, Entry<V>>();
  constructor(private opts: CacheOptions) {}

  get(key: K): V | undefined {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires < now) {
      this.store.delete(key);
      return undefined;
    }
    entry.last = now;
    return entry.value;
  }

  set(key: K, value: V) {
    const now = Date.now();
    if (this.store.size >= this.opts.maxEntries) {
      // Evict least recently used
      let lruKey: K | undefined;
      let lruLast = Infinity;
      for (const [k, e] of this.store.entries()) {
        if (e.last < lruLast) {
          lruLast = e.last;
          lruKey = k;
        }
      }
      if (lruKey !== undefined) this.store.delete(lruKey);
    }
    this.store.set(key, { value, expires: now + this.opts.ttlMs, last: now });
  }
}

export const scryfallCache = new TTLCache<string, any>({ ttlMs: 1000 * 30, maxEntries: 200 });
