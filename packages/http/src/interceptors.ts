import type { RequestContext, RequestInterceptor, ResponseInterceptor } from './types';

export function authTokenInterceptor(getToken: () => string | null): RequestInterceptor {
  return (ctx) => {
    const token = getToken();
    if (!token) return ctx;
    return { ...ctx, init: { ...ctx.init, headers: { ...(ctx.init.headers as Record<string, string>), Authorization: `Bearer ${token}` } } };
  };
}

export function idempotencyKeyInterceptor(key?: string): RequestInterceptor {
  return (ctx) => {
    if (!key) return ctx;
    return { ...ctx, init: { ...ctx.init, headers: { ...(ctx.init.headers as Record<string, string>), 'Idempotency-Key': key } } };
  };
}

export const jsonResponseInterceptor: ResponseInterceptor = async (res) => res;

export async function applyRequestInterceptors(ctx: RequestContext, interceptors: RequestInterceptor[]): Promise<RequestContext> {
  let next = ctx;
  for (const i of interceptors) next = await i(next);
  return next;
}

export async function applyResponseInterceptors(res: Response, ctx: RequestContext, interceptors: ResponseInterceptor[]): Promise<Response> {
  let next = res;
  for (const i of interceptors) next = await i(next, ctx);
  return next;
}
