# Contributing

Thanks for helping improve Workbench Inventory. This document explains how to set up locally, what we expect in pull requests, and where to extend the system.

## Development setup

1. Install **Node.js 22+** and **npm**.
2. Clone the repository and run `npm install` at the repo root (workspaces install the frontend).
3. Copy environment variables as needed (see `docs/guide/configuration.md` and any `.env.example`).
4. Run database migrations: `npm run migration:run`.
5. Start the API: `npm run start:dev`.
6. In another terminal, start the Vite app: `cd frontend && npm run dev`.

Quality checks before opening a PR:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
```

**VitePress** (`docs/`): the default `base` matches GitHub Pages at `https://bankersman.github.io/workbench-inventory/`. For a local dev server at the site root, run `VITEPRESS_BASE=/ npm run docs:dev`.

## Branches and commits

- Use short-lived branches off `main` named by intent, e.g. `fix/order-list-csv`, `feat/label-template`.
- Write commit messages in the imperative mood (`feat: add backup download endpoint`). Conventional-style prefixes (`feat:`, `fix:`, `chore:`) help readers and changelog maintenance.

## Pull requests

- Describe **what** changed and **why** (not only the diff).
- Ensure **CI-equivalent** checks pass locally: lint, format, typecheck, tests, build.
- If you change user-visible behavior, update **CHANGELOG.md** under `[Unreleased]` and, when relevant, the VitePress docs under `docs/`.
- If you add a dependency, explain briefly and keep the lockfile in sync (`npm install` at root).

## Review expectations

Reviewers look for: correctness, tests for non-trivial logic, consistent patterns with existing modules, and no unrelated refactors.

## Adding a supplier integration

1. Implement lookup against the shared result shape (`src/suppliers/supplier-api.types.ts`).
2. Register the service in `src/suppliers/suppliers.module.ts` and call it from `SupplierRefreshService` when the `supplier_data.supplier` name matches your integration.
3. Add or extend tests with HTTP mocked (avoid live API calls in CI).

## Adding a label template

1. Extend `LabelService` (`src/labels/label.service.ts`) with layout logic; keep PNG generation bounded and deterministic for tests where possible.
2. Expose the template string via `PreviewLabelDto` / UI selectors.
3. Ensure the Python sidecar still accepts base64 PNG for `POST /print` (no change needed if the payload format is unchanged).

## Adding a default category

Use the category seed/migration path described in `PLAN.md` and `src/database/` — prefer migrations over ad-hoc SQL for anything shipped to production.

## Code style

ESLint and Prettier enforce most formatting and common issues. Prefer explicit types on public APIs; avoid `any`.

## Tests

- Backend: Jest (`npm run test`, `npm run test:cov`).
- Frontend: Vitest in `frontend/` (`npm run test --workspace frontend`).

When adding features, add focused unit tests for services and pure utilities; UI tests are welcome for critical flows when they stay stable.
