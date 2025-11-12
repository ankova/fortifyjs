import { describe, it, expect, vi, afterEach } from 'vitest';
import { z } from 'zod';

import { HttpClient } from '../src';

describe('HttpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('parses schema and returns ok Result', async () => {
    const ResponseCtor = (globalThis as any).Response ?? Response;

    // Mock a successful JSON response with proper content-type
    const fakeFetch = vi
      .fn<Parameters<typeof globalThis.fetch>, ReturnType<typeof globalThis.fetch>>()
      .mockResolvedValue(
        new ResponseCtor(JSON.stringify({ id: 1, name: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    // Option A: Stub global fetch (HttpClient auto-detects it)
    vi.stubGlobal('fetch', fakeFetch);

    // Option B (alternative): inject fetch via constructor if supported
    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      headers: { 'x-test': '1' },
      timeoutMs: 2000,
      // fetch: fakeFetch, // uncomment if your ClientOptions exposes `fetch`
    } as any);

    const Schema = z.object({ id: z.number(), name: z.string() });

    // ✅ Correct call signature: schema is the 2nd arg, options is 3rd
    const res = await client.request('/user/1', Schema, { method: 'GET' });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe(1);
      expect(res.data.name).toBe('ok');
    }

    // Sanity checks on fetch call
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fakeFetch.mock.calls[0];
    expect(calledUrl).toBe('https://api.example.com/user/1');
    expect(calledInit?.method).toBe('GET');
    expect((calledInit?.headers as Record<string, string>)['x-test']).toBe('1');
  });
});
