# 🤝 Contributing to FortifyJS

First off — thank you for your interest in improving **FortifyJS**!
Contributions of all kinds are welcome — from small fixes to new features, documentation, or test improvements.

---

## 🧱 Project Overview

FortifyJS provides **TypeScript-first reliability utilities** for modern frontend apps — safe async handling, typed storage, feature flags, and React bindings.

Our principles:

- **Type safety** → every public API must be strongly typed.
- **Reliability** → no unhandled promises or null access.
- **Composability** → simple, predictable building blocks.
- **Clarity** → readable code with consistent conventions.

---

## ⚙️ Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/ankova/fortifyjs.git
cd fortifyjs
pnpm install
```

### 2. Build the project

```bash
pnpm build
```

### 3. Run tests

```bash
pnpm test
```

### 4. Start the example app (optional)

```bash
cd examples/react-demo
pnpm dev
```

---

## 🧩 Folder Structure

```
fortifyjs/
 ├─ src/             # Core library modules
 ├─ tests/           # Unit tests
 ├─ examples/        # React demo apps
 ├─ docs/            # Architecture & guides
 ├─ .github/         # CI/CD and workflows
 └─ package.json
```

---

## 🧪 Testing Guidelines

- Use **Vitest** for unit tests.
- Aim for ≥ 90% coverage for new code.
- Run `pnpm test:watch` during development.
- For React bindings, use **React Testing Library**.

Example:

```ts
import { safeAsync } from '../src/async';

test('safeAsync returns tuple', async () => {
  const [res, err] = await safeAsync(Promise.resolve('ok'));
  expect(res).toBe('ok');
  expect(err).toBeNull();
});
```

---

## 🧾 Commit Conventions

We follow the **Conventional Commits** spec:

```
<type>(scope): short summary
```

Common types:
| Type | Meaning |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation updates |
| `test` | Tests or coverage |
| `refactor` | Code restructure (no behavior change) |
| `chore` | Maintenance, build, CI |

Examples:

```
feat(async): add retry option to safeAsync
fix(storage): handle invalid JSON gracefully
docs: add async module usage examples
```

---

## 🧩 Code Style

- Use **TypeScript strict mode**.
- Enforce formatting via **ESLint + Prettier**.
- Avoid `any` and untyped return values.
- Write pure, predictable functions — no side effects in utilities.
- Keep dependencies minimal; prefer native or TS-based solutions.

Run before committing:

```bash
pnpm lint && pnpm test
```

---

## 🧠 Pull Requests

1. Create a new branch:
   ```bash
   git checkout -b feat/<your-feature-name>
   ```
2. Write or update unit tests for any code change.
3. Update relevant docs or README sections.
4. Open a PR against the `main` branch.
5. The CI workflow will:
   - Lint your code
   - Run tests
   - Check types
   - Verify build integrity

---

## 💬 Discussions & Issues

- Report bugs via [GitHub Issues](../../issues)
- Use clear, reproducible examples (stack trace, steps, expected vs. actual behavior).
- For questions or feature ideas, open a **Discussion** thread first if uncertain.

---

## 🧠 Releasing

Only maintainers trigger releases:

```bash
pnpm changeset
pnpm release
```

This will version packages and auto-publish to npm via GitHub Actions.

---

## 🏁 Code of Conduct

Be respectful, constructive, and inclusive.
Treat every contribution as collaboration, not competition.
We aim to keep the project welcoming for all skill levels.

---

## 🫶 Thank You

Every contribution — big or small — makes FortifyJS stronger.
Your input helps us build safer, more reliable frontend ecosystems.
