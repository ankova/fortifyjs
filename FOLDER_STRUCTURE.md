fortifyjs/
├─ pnpm-workspace.yaml
├─ package.json                 # root: fortifyjs (monorepo config, scripts, dev deps)
├─ tsconfig.base.json           # shared TS config for all packages
├─ .eslintrc.cjs                # shared eslint config
├─ .prettierrc                  # shared prettier config
├─ .gitignore
├─ .changeset/                  # (optional now, required once you init changesets)
│  └─ config.json
└─ packages/
   ├─ core/
   │  ├─ package.json           # @fortifyjs/core
   │  ├─ src/
   │  │  ├─ index.ts
   │  │  ├─ result.ts
   │  │  ├─ safeAsync.ts
   │  │  ├─ storage.ts
   │  │  ├─ flags.ts
   │  │  └─ internal/
   │  ├─ tsconfig.json
   │  └─ vitest.config.ts
   │
   ├─ http/
   │  ├─ package.json           # @fortifyjs/http
   │  ├─ src/
   │  │  ├─ index.ts
   │  │  ├─ client.ts           # core HTTP client
   │  │  ├─ interceptors.ts     # auth, idempotency keys, etc.
   │  │  ├─ retry.ts
   │  │  ├─ circuitBreaker.ts
   │  │  └─ types.ts
   │  ├─ tsconfig.json
   │  └─ vitest.config.ts
   │
   └─ react/
      ├─ package.json           # @fortifyjs/react
      ├─ src/
      │  ├─ index.ts
      │  ├─ FortifyBoundary.tsx     # error boundaries
      │  ├─ useSafeAsync.ts         # SSR-safe async hooks
      │  ├─ useFeatureFlag.ts
      │  └─ providers/
      ├─ tsconfig.json
      └─ vitest.config.ts

└─ examples/
   └─ react-app/
      ├─ package.json           # uses @fortifyjs/core, @fortifyjs/http, @fortifyjs/react
      ├─ src/
      └─ ...
