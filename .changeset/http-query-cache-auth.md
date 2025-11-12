---
"@fortifyjs/http": minor
---

Add:
- Type-safe query builder (`buildQuery`) with array support and Date→ISO.
- Response cache with SWR (TTL + stale-while-revalidate).
- `withAuth()` wrapper for token injection and 401 auto refresh+retry.
- `createEndpoint()` now uses the query builder.
