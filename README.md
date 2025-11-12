# 🛡️ FortifyJS

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Build](https://img.shields.io/github/actions/workflow/status/ankova/fortifyjs/ci.yml?branch=main)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

> **Typed guardrails for reliable, predictable, and maintainable frontend engineering.**

---

## ✨ Overview

**FortifyJS** standardises the foundational utilities every modern frontend team ends up rewriting —  
safe async handling, result typing, feature flags, storage, and typed HTTP clients — all with idiomatic React bindings.

It’s framework-agnostic, fully typed, SSR-safe, and ready for production.

---

## 🧩 Monorepo Structure

| Package                                | Description                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`@fortifyjs/core`](./packages/core)   | Core primitives: `Result`, `SafeAsync`, schema-typed storage, feature flags.                 |
| [`@fortifyjs/http`](./packages/http)   | Typed HTTP client with zod validation, retries, timeouts, interceptors, and circuit breaker. |
| [`@fortifyjs/react`](./packages/react) | React bindings: secure error boundaries, SSR-safe hooks, and flag providers.                 |

---

## 🚀 Quick Start

### Install

```bash
# with pnpm
pnpm add @fortifyjs/core @fortifyjs/http @fortifyjs/react zod
```

### Example – Safe Async & Result

```ts
import { safeAsync, ok, err, type Result } from '@fortifyjs/core';

async function fetchUser(): Promise<Result<User, Error>> {
  return safeAsync(async () => {
    const res = await fetch('/api/user');
    if (!res.ok) throw new Error('Request failed');
    return await res.json();
  });
}

const result = await fetchUser();

if (result.ok) {
  console.log('✅', result.value);
} else {
  console.error('❌', result.error);
}
```

---

### Example – Typed HTTP Client

```ts
import { HttpClient } from '@fortifyjs/http';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const http = new HttpClient({ baseUrl: 'https://api.example.com' });

const result = await http.get('/users/1', userSchema);

if (result.ok) console.log(result.value);
```

---

### Example – React Bindings

```tsx
import { FeatureFlagProvider, useFeatureFlag } from '@fortifyjs/react';

function Dashboard() {
  const isNewUI = useFeatureFlag('new_ui');
  return isNewUI ? <NewDashboard /> : <LegacyDashboard />;
}

export function App() {
  return (
    <FeatureFlagProvider initialFlags={{ new_ui: true }}>
      <Dashboard />
    </FeatureFlagProvider>
  );
}
```

---

## 🧠 Design Goals

- **Predictability** – Every async operation returns a `Result<T, E>`.
- **Safety** – Type-checked data flows with runtime validation (via Zod).
- **Resilience** – Built-in retries, circuit breakers, and timeout guards.
- **Integration** – React hooks that are SSR-safe and feature-flag aware.
- **Zero bloat** – Fully tree-shakable and framework-agnostic.

---

## 🧪 Development

```bash
pnpm install
pnpm build
pnpm test
```

To test locally:

```bash
npx tsx test.ts
```

Run full CI locally:

```bash
pnpm ci
```

---

## 📦 Releasing

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

```bash
pnpm changeset
pnpm release
```

---

## 🪪 License

[MIT](./LICENSE)

---

## 💬 Philosophy

Modern frontends need invisible _guardrails_ — consistency, safety, and confidence in every async flow.  
**FortifyJS** gives teams that foundation: simple, composable primitives that keep production code predictable and easy to reason about.
