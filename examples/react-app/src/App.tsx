import { useState } from 'react';
import { Result, createTypedStorage } from '@fortifyjs/core';
import { FeatureFlagProvider, useFeatureFlag, SecureErrorBoundary } from '@fortifyjs/react';
import { z } from 'zod';
import { HttpClient, CircuitBreaker, authTokenInterceptor, idempotencyKeyInterceptor, createEndpoint, withAuth } from '@fortifyjs/http';

const prefsSchema = z.object({ theme: z.enum(['light', 'dark']).default('light') });
const storage = createTypedStorage('prefs', prefsSchema, window.localStorage);

const helloRes = z.object({ message: z.string() });
const hello = createEndpoint({ method: 'GET', path: '/api/hello/:id', response: helloRes });

const baseClient = new HttpClient({
  baseUrl: '',
  breaker: new CircuitBreaker({ failureThreshold: 3, coolDownMs: 5000, halfOpenMaxInFlight: 1 }),
  cache: { enabled: true, ttlMs: 2000, swrMs: 20000 },
  requestInterceptors: [
    authTokenInterceptor(() => window.localStorage.getItem('token')),
    idempotencyKeyInterceptor('demo-key-123'),
  ],
});

const client = withAuth(baseClient, {
  getToken: () => window.localStorage.getItem('token'),
  refreshToken: async () => {
    const r = await fetch('/api/refresh');
    if (!r.ok) return null;
    const { token } = await r.json();
    window.localStorage.setItem('token', token);
    return token;
  },
});

function FetchButton() {
  const [state, setState] = useState<Result<string> | null>(null);
  const newApi = useFeatureFlag('newApi');

  async function load() {
    const url = newApi ? '/api/new' : '/api/old';
    const r = await client.request(url, helloRes, { method: 'GET', retry: { retries: 3 } });
    setState(r.ok ? { ok: true, value: r.data.message } : { ok: false, error: r.error });
  }

  async function loadById() {
    const r = await hello.call(client, { params: { id: '42' } });
    setState(r.ok ? { ok: true, value: r.data.message } : { ok: false, error: r.error });
  }

  return (
    <div>
      <button onClick={load}>Fetch</button>
      <button onClick={loadById}>Fetch by ID</button>
      {state?.ok && <div data-testid="ok">OK: {state.value}</div>}
      {state && !state.ok && <div data-testid="err">ERR: {state.error.message}</div>}
    </div>
  );
}

export default function App() {
  return (
    <SecureErrorBoundary fallback={<div>Something went wrong.</div>}>
      <FeatureFlagProvider flags={{ newApi: true }}>
        <h1>fortifyjs demo</h1>
        <FetchButton />
      </FeatureFlagProvider>
    </SecureErrorBoundary>
  );
}
