# Changelog

## [Unreleased]

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
