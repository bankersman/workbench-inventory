# Changelog

## [Unreleased]

### [Phase 1.3] Verify — 2026-04-20

**Done**

- `GET /api/health` returns `{ ok: true, version: string }` with `version` read from root `package.json` (`AppService.getAppVersion()`).

**Tests**

- `app.controller.spec.ts` — health payload shape and semver-like version string.

**Considerations**

- Version is resolved at `AppService` construction from `process.cwd()`; correct when the server is started from the repo root (Docker/PM2 should set cwd accordingly).

### [Phase 1.2] Entities and migration — 2026-04-20

**Done**

- TypeORM entities for PLAN.md data model: `StorageUnit`, `Category`, `Project` (`ProjectStatus`), `Container`, `Item`, `SupplierData`, `BOMLine`; shared `ALL_ENTITIES` export; category attribute typing in `category-attribute.types.ts`.
- Initial migration `src/migrations/1776715115341-InitialSchema.ts` (SQLite tables, FKs, `items.attributes` default `'{}'`); `migrationsRun: true` in Nest so pending migrations apply on startup; `src/data-source.ts` for TypeORM CLI.
- `resolveDatabasePath()` moved to `src/database/database-path.ts` for reuse with CLI.
- `CategorySeedService` + `default-categories.ts`: seeds all PLAN.md default categories when `categories` is empty; `seedDefaultCategoriesIfEmpty()` for tests and idempotency.
- Root scripts: `migration:run`, `migration:generate` (append migration name path after `--`).

**Tests**

- `src/database/category-seed.service.spec.ts` — in-memory SQLite: full seed list, skip when non-empty, double-call idempotency.

**Considerations**

- **Bidirectional TypeORM relations:** Inverse `@OneToMany` sides omitted where they caused circular imports; FK `@ManyToOne` sides are sufficient for schema and queries (inverse relations can be re-added later with lazy patterns if needed).
- **Item.attributes default:** SQL migration sets `DEFAULT ('{}')`; entity has no TypeORM `default` to avoid the broken `DEFAULT ([object Object])` TypeORM generated for `simple-json`.
- **Auto-generated migration replaced:** First `migration:generate` output included invalid JSON defaults and redundant SQLite table rebuilds; replaced with a single hand-written `up`/`down` matching entities.

### [Phase 1.1] Project scaffold and tooling — 2026-04-20

**Done**

- Monorepo with npm workspace `frontend/` (Vite + React + TypeScript) and NestJS backend at repo root (`src/`).
- Root scripts: `lint`, `format`, `format:check`, `test` (Jest + Vitest), `test:watch`, `test:cov`, `typecheck`, `build`, `start`, `start:dev`, `start:prod`.
- Strict TypeScript via `tsconfig.base.json` (backend `tsconfig.json`, frontend extends base in `tsconfig.app.json`).
- ESLint 9 flat config (`eslint.config.mjs`) with TypeScript rules for `src/` and React hooks / refresh for `frontend/`; Prettier via `eslint-config-prettier` and `.prettierrc` (PLAN.md excluded from formatting).
- TypeORM + `better-sqlite3`: database path from `DB_PATH`, default `${cwd}/data/inventory.db`; `PRAGMA journal_mode=WAL` on startup (`DatabaseInitService`).
- `@nestjs/serve-static` serves `dist/frontend` when present (after `npm run build`); API under global prefix `/api`.
- Core dependencies from PLAN installed (TypeORM stack, websockets, schedule, serialport, canvas, bwip-js, dotenv, socket.io).
- Dev tooling: Jest + ts-jest for backend; Vitest + Testing Library + jsdom for frontend smoke test.
- `.env.example` documenting primary environment variables.

**Tests**

- `src/app.controller.spec.ts` — root controller message.
- `src/database/database-init.service.spec.ts` — WAL pragma on module init (mocked `DataSource`).
- `frontend/src/env.test.ts` — Vitest wiring.

**Considerations**

- **Node version:** PLAN specifies Node.js 24+; environment currently reports v22.22.0. Dependencies install and tests pass on Node 22; upgrade to 24+ for production alignment when available.
- **`@nestjs/platform-socket.io`:** Not added yet; `socket.io` is installed for later WebSocket gateway work (Phase 3).
- **Static assets:** `ServeStaticModule` is only registered when `dist/frontend` exists (typically after `npm run build`), so `nest start` without a prior full build still runs API-only — intentional for backend-only dev.
