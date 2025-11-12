import { HttpClient, type ClientOptions } from './client';
import { authTokenInterceptor } from './interceptors';
import type { RequestInterceptor, ResponseInterceptor, FetchLike } from './types';
import type { CircuitBreaker } from './circuitBreaker';

export type WithAuthOptions = {
  getToken: () => string | null | Promise<string | null>;
  refreshToken: () => Promise<string | null>;
  /**
   * Header to use for the auth token.
   * Defaults to "Authorization" (sent as "Bearer <token>").
   * For custom names, the raw token value is used.
   */
  headerName?: string;
};

/**
 * Wrap an existing HttpClient with auth capabilities:
 * - attaches auth tokens on requests
 * - on 401, attempts token refresh and retries once with new token
 * - preserves base client's fetch, breaker, interceptors & cache presence
 */
export function withAuth(base: HttpClient, opts: WithAuthOptions): HttpClient {
  const headerName = opts.headerName ?? 'Authorization';

  // Reuse base wiring
  const fetchImpl: FetchLike = base.getFetch();
  const existingReq: RequestInterceptor[] = base.getRequestInterceptors();
  const existingRes: ResponseInterceptor[] = base.getResponseInterceptors();
  const breaker: CircuitBreaker | undefined = base.getBreaker();
  const hasCache = base.hasCache();

  // Helper for legacy authTokenInterceptor: expects sync getter
  const syncGetToken = () => {
    const v = opts.getToken();
    return v instanceof Promise ? null : v;
  };

  // Async-aware token injector (runs first)
  const tokenInterceptor: RequestInterceptor = async (ctx) => {
    const token = await opts.getToken();
    if (!token) return ctx;

    const headers = new Headers(ctx.init.headers ?? {});
    const name = headerName;
    headers.set(name, name.toLowerCase() === 'authorization' ? `Bearer ${token}` : token);

    return {
      ...ctx,
      init: {
        ...ctx.init,
        headers,
      },
    };
  };

  // On 401, try to refresh and retry once with the new token
  const refreshInterceptor: ResponseInterceptor = async (res, ctx) => {
    if (res.status !== 401) return res;

    const newToken = await opts.refreshToken();
    if (!newToken) return res;

    const headers = new Headers(ctx.init.headers ?? {});
    const name = headerName;
    headers.set(name, name.toLowerCase() === 'authorization' ? `Bearer ${newToken}` : newToken);

    return fetchImpl(ctx.url, {
      ...ctx.init,
      headers,
    });
  };

  const requestInterceptors: RequestInterceptor[] = [
    tokenInterceptor,
    // keep compatibility with existing helper:
    authTokenInterceptor(syncGetToken),
    ...existingReq,
  ];

  const responseInterceptors: ResponseInterceptor[] = [refreshInterceptor, ...existingRes];

  // Build ClientOptions respecting exactOptionalPropertyTypes
  const next: ClientOptions = {
    // only include `baseUrl` when defined so we don't assign `string | undefined`
    // to an optional property under `exactOptionalPropertyTypes`.
    ...(base.baseUrl ? { baseUrl: base.baseUrl } : {}),
    headers: {}, // let interceptors handle auth/header composition
    fetch: fetchImpl,
    requestInterceptors,
    responseInterceptors,
    cache: { enabled: hasCache },
  };

  if (breaker) {
    next.breaker = breaker;
  }

  return new HttpClient(next);
}
