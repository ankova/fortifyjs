export type CacheEntry<T = unknown> = {
  data: T;
  status: number;
  headers: Headers;
  updatedAt: number;
  ttlMs: number;
  swrMs: number;
  revalidating?: boolean;
};

export type CacheKey = string;

export type CacheOptions = {
  enabled?: boolean;
  ttlMs?: number;
  swrMs?: number;
  keyFn?: (method: string, url: string) => CacheKey;
};

export class ResponseCache {
  private store = new Map<CacheKey, CacheEntry>();
  constructor(private opts: Required<CacheOptions>) {}

  static defaults(): Required<CacheOptions> {
    return { enabled: true, ttlMs: 5000, swrMs: 30000, keyFn: (m,u) => `${m} ${u}` };
  }

  get<T>(method: string, url: string): CacheEntry<T> | undefined {
    const key = this.opts.keyFn(method, url);
    return this.store.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(method: string, url: string, entry: Omit<CacheEntry<T>, 'ttlMs'|'swrMs'>) {
    const key = this.opts.keyFn(method, url);
    this.store.set(key, { ...entry, ttlMs: this.opts.ttlMs, swrMs: this.opts.swrMs });
  }

  markRevalidating(method: string, url: string, val: boolean) {
    const key = this.opts.keyFn(method, url);
    const e = this.store.get(key);
    if (e) this.store.set(key, { ...e, revalidating: val });
  }

  isFresh(entry: CacheEntry) { return Date.now() - entry.updatedAt < entry.ttlMs; }
  isWithinSWR(entry: CacheEntry) { return Date.now() - entry.updatedAt < entry.ttlMs + entry.swrMs; }
}
