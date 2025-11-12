import { z } from 'zod';
import type { ZodTypeAny, ZodSchema } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type FetchLike = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export type RequestOptions<TBody = unknown> = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  signal?: AbortSignal;
  timeoutMs?: number; // per-attempt timeout
  retry?: {
    retries?: number;
    backoffMs?: number; // base backoff
    maxBackoffMs?: number;
  };
  idempotent?: boolean; // if false, we won't retry non-GET by default
  idempotencyKey?: string; // if provided, adds Idempotency-Key header
};

export type ParsedResponse<T> =
  | { ok: true; status: number; data: T; headers: Headers }
  | { ok: false; status: number; error: Error; headers: Headers | null };

export type Schema<T> = ZodSchema<T>;
export type Infer<T extends ZodTypeAny> = z.infer<T>;

export type RequestContext = {
  url: string;
  init: RequestInit & { timeoutMs?: number };
};

export type RequestInterceptor = (ctx: RequestContext) => Promise<RequestContext> | RequestContext;

export type ResponseInterceptor = (
  res: Response,
  ctx: RequestContext,
) => Promise<Response> | Response;
