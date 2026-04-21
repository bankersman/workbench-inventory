# Contributing

Thanks for helping improve Workbench Inventory. This document explains how to set up locally, what we expect in pull requests, and where to extend the system.

## Development setup

1. Install **Node.js 24+** and **pnpm** (see `package.json` `engines.node` and `packageManager`). With [nvm](https://github.com/nvm-sh/nvm), run `nvm install` / `nvm use` in the repo root (`.nvmrc` pins **24**). Enable Corepack once (`corepack enable`) so the pinned pnpm version from `packageManager` is on your `PATH`, or install pnpm per [pnpm.io/installation](https://pnpm.io/installation).
2. Clone the repository and run `pnpm install` at the repo root (the workspace installs `frontend/`).
3. Copy environment variables as needed (see `docs/guide/configuration.md` and any `.env.example`).
4. Run database migrations: `pnpm run migration:run`.
5. Start the API: `pnpm run start:dev`.
6. In another terminal, start the Vite app: `pnpm --filter frontend run dev` (or `cd frontend && pnpm run dev`).

Quality checks before opening a PR:

```bash
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run test
pnpm run build
```

**VitePress** (`docs/`): the default `base` matches GitHub Pages at `https://bankersman.github.io/workbench-inventory/`. For a local dev server at the site root, run `VITEPRESS_BASE=/ pnpm run docs:dev`.

## Branches and commits

- Use short-lived branches off `main` named by intent, e.g. `fix/order-list-csv`, `feat/label-template`.
- Write commit messages in the imperative mood (`feat: add backup download endpoint`). Conventional-style prefixes (`feat:`, `fix:`, `chore:`) help readers and changelog maintenance.

## Pull requests

- Describe **what** changed and **why** (not only the diff).
- Ensure **CI-equivalent** checks pass locally: lint, format, typecheck, tests, build.
- If you change user-visible behavior, update **CHANGELOG.md** under `[Unreleased]` and, when relevant, the VitePress docs under `docs/`.
- If you add a dependency, explain briefly and keep the lockfile in sync (`pnpm add …` at the repo root or under `frontend/` as appropriate).

## Review expectations

Reviewers look for: correctness, tests for non-trivial logic, consistent patterns with existing modules, and no unrelated refactors.

## Adding a supplier integration

1. Implement lookup against the shared result shape (`src/suppliers/supplier-api.types.ts`).
2. Register the service in `src/suppliers/suppliers.module.ts` and call it from `SupplierRefreshService` when the `supplier_data.supplier` name matches your integration.
3. Add or extend tests with HTTP mocked (avoid live API calls in CI).

## Adding a label template

1. Extend `LabelService` (`src/labels/label.service.ts`) with layout logic; keep PNG generation bounded and deterministic for tests where possible.
2. Expose the template string via `PreviewLabelDto` / UI selectors.
3. Physical printing still flows through `POST /api/labels/print` → `BrotherQlService` (`@brother-ql/node`); keep PNG output compatible with the printer pipeline.

## Adding a default category

Use the category seed/migration path described in `PLAN.md` and `src/database/` — prefer migrations over ad-hoc SQL for anything shipped to production.

## Code style

ESLint and Prettier enforce most formatting and common issues. Prefer explicit types on public APIs; avoid `any`.

## Tests

- Backend: Jest (`pnpm run test`, `pnpm run test:cov`).
- Frontend: Vitest in `frontend/` (`pnpm --filter frontend run test`).

When adding features, add focused unit tests for services and pure utilities; UI tests are welcome for critical flows when they stay stable.
