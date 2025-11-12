import { z } from 'zod';
import type { ZodTypeAny } from 'zod';

import { TimeoutError, HttpError, CircuitOpenError } from './errors';
import { CircuitBreaker } from './circuitBreaker';
import type {
  FetchLike,
  RequestOptions,
  ParsedResponse,
  RequestContext,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';
import { applyRequestInterceptors, applyResponseInterceptors } from './interceptors';
import { ResponseCache, type CacheOptions } from './cache';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(base: number, attempt: number, max: number): number {
  const exp = Math.min(base * 2 ** attempt, max);
  return Math.floor(exp / 2 + (Math.random() * exp) / 2);
}

export type ClientOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  fetch?: FetchLike;
  breaker?: CircuitBreaker;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  cache?: CacheOptions;
};

export class HttpClient {
  readonly baseUrl: string | undefined;
  private readonly headers: Record<string, string>;
  private readonly fetchFn: FetchLike;
  private readonly breaker: CircuitBreaker | undefined;
  private readonly reqInts: RequestInterceptor[];
  private readonly resInts: ResponseInterceptor[];
  private readonly cache: ResponseCache | undefined;

  constructor(opts: ClientOptions = {}) {
    this.baseUrl = opts.baseUrl;
    this.headers = opts.headers ?? {};

    // Resolve fetch implementation
    const globalFetch =
      typeof globalThis !== 'undefined' && typeof (globalThis as any).fetch === 'function'
        ? ((globalThis as any).fetch as FetchLike).bind(globalThis)
        : undefined;

    if (opts.fetch) {
      this.fetchFn = opts.fetch;
    } else if (globalFetch) {
      this.fetchFn = globalFetch;
    } else {
      this.fetchFn = (() => {
        throw new Error(
          '[@fortifyjs/http] No fetch implementation provided and globalThis.fetch is not available.',
        );
      }) as unknown as FetchLike;
    }

    this.breaker = opts.breaker;
    this.reqInts = opts.requestInterceptors ?? [];
    this.resInts = opts.responseInterceptors ?? [];

    // Cache: respect explicit enabled flag; default to enabled when cache options omitted.
    const cacheOpts = opts.cache;
    const cacheEnabled = cacheOpts?.enabled ?? true;

    if (cacheEnabled) {
      const cfg = {
        ...ResponseCache.defaults(),
        ...(cacheOpts ?? {}),
        enabled: true,
      };
      this.cache = new ResponseCache(cfg);
    } else {
      this.cache = undefined;
    }
  }

  // ------ Introspection helpers for decorators (e.g. withAuth) ------

  getFetch(): FetchLike {
    return this.fetchFn;
  }

  getBreaker(): CircuitBreaker | undefined {
    return this.breaker;
  }

  getRequestInterceptors(): RequestInterceptor[] {
    return [...this.reqInts];
  }

  getResponseInterceptors(): ResponseInterceptor[] {
    return [...this.resInts];
  }

  hasCache(): boolean {
    return !!this.cache;
  }

  // ------ Core request method ------

  async request<TSchema extends ZodTypeAny, TBody = unknown>(
    path: string,
    schema: TSchema,
    options: RequestOptions<TBody> = {},
  ): Promise<ParsedResponse<z.infer<TSchema>>> {
    const {
      method = 'GET',
      headers = {},
      body,
      retry,
      timeoutMs = 10_000,
      idempotent,
      idempotencyKey,
    } = options;

    if (this.breaker && !this.breaker.canRequest()) {
      return {
        ok: false,
        status: 0,
        error: new CircuitOpenError(),
        headers: null,
      };
    }

    const url = (this.baseUrl ?? '') + path;

    // Cache lookup for GET + SWR behaviour
    if (method === 'GET' && this.cache) {
      const hit = this.cache.get<unknown>(method, url);
      if (hit) {
        if (this.cache.isFresh(hit)) {
          return {
            ok: true,
            status: hit.status,
            data: hit.data as z.infer<TSchema>,
            headers: hit.headers,
          };
        }

        if (this.cache.isWithinSWR(hit) && !hit.revalidating) {
          this.cache.markRevalidating(method, url, true);
          // Pass the original options object directly. Avoid spreading in a
          // possibly-undefined `retry` property because with
          // `exactOptionalPropertyTypes` that creates a `{ ... } | undefined`
          // union which is not assignable to the expected optional property
          // type. `options` already contains `retry` when present.
          void this.request<TSchema, TBody>(path, schema, options);
          this.cache.markRevalidating(method, url, false);

          return {
            ok: true,
            status: hit.status,
            data: hit.data as z.infer<TSchema>,
            headers: hit.headers,
          };
        }
      }
    }

    const attempts = Math.max(1, retry?.retries ?? 2);
    const baseBackoff = retry?.backoffMs ?? 300;
    const maxBackoff = retry?.maxBackoffMs ?? 5_000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      if (this.breaker) this.breaker.onRequestStart();

      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), timeoutMs);

      try {
        const initial: RequestContext = {
          url,
          init: {
            method,
            headers: {
              'content-type': 'application/json',
              ...this.headers,
              ...headers,
              ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
            },
            // RequestInit.body accepts BodyInit | null; use null instead of
            // undefined to satisfy strict `exactOptionalPropertyTypes` typing.
            body: body != null ? JSON.stringify(body) : null,
            signal: ctrl.signal,
            timeoutMs,
          },
        };

        const ctx = await applyRequestInterceptors(initial, this.reqInts);
        const res0 = await this.fetchFn(ctx.url, ctx.init);
        const res = await applyResponseInterceptors(res0, ctx, this.resInts);

        clearTimeout(timeoutId);

        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok) {
          const httpErr = new HttpError(`HTTP ${res.status}`, res.status, json);
          lastError = httpErr;
          if (this.breaker) this.breaker.onFailure();
        } else {
          const parsed = schema.safeParse(json);
          if (!parsed.success) {
            const zerr = new HttpError('Schema validation failed', res.status, parsed.error);
            lastError = zerr;
            if (this.breaker) this.breaker.onFailure();
          } else {
            if (this.breaker) this.breaker.onSuccess();

            if (method === 'GET' && this.cache) {
              this.cache.set(method, url, {
                data: parsed.data,
                headers: res.headers,
                status: res.status,
                updatedAt: Date.now(),
              });
            }

            return {
              ok: true,
              status: res.status,
              data: parsed.data,
              headers: res.headers,
            };
          }
        }
      } catch (e) {
        clearTimeout(timeoutId);

        const err =
          (e as any)?.name === 'AbortError'
            ? new TimeoutError()
            : e instanceof Error
              ? e
              : new Error(String(e));

        lastError = err;
        if (this.breaker) this.breaker.onFailure();
      }

      const resolvedIdempotent = idempotent ?? method === 'GET';
      const hasMoreAttempts = attempt < attempts - 1;

      if (!(resolvedIdempotent && hasMoreAttempts)) {
        break;
      }

      await sleep(jitter(baseBackoff, attempt, maxBackoff));
    }

    return {
      ok: false,
      status: 0,
      error: lastError ?? new Error('Unknown error'),
      headers: null,
    };
  }
}
