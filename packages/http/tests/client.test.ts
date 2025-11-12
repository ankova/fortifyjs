import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

import { HttpClient } from '../src';

describe('HttpClient', () => {
  it('parses schema and returns ok Result', async () => {
    const fakeFetch = vi.fn(
      async () => new Response(JSON.stringify({ id: 1, name: 'ok' }), { status: 200 }),
    ) as unknown as typeof fetch;

    const c = new HttpClient({
      baseUrl: 'https://api.example.com',
      headers: {},
      timeoutMs: 2000,
    } as any);
    (c as any).fetchFn = fakeFetch;

    const Schema = z.object({ id: z.number(), name: z.string() });
    const res = await c.request('/user/1', { method: 'GET', schema: Schema });

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.name).toBe('ok');
  });
});
