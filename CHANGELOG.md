# Changelog

## [Unreleased]

### Docker / label sidecar — `LABEL_SIDECAR_PORT` — 2026-04-20

**Done**

- Flask sidecar reads `LABEL_SIDECAR_PORT` (default `5050`) instead of `PORT`, so the main app’s `PORT` no longer collides with the sidecar when both run in one container. `Dockerfile`, `docker-compose.yml`, `.env.example`, and docs updated.

### CI — GitHub Actions runtime (Node 24) — 2026-04-20

**Done**

- Bumped `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `actions/upload-pages-artifact`, and `actions/deploy-pages` to current majors so workflows use the Node 24 action runtime (addresses GitHub deprecation notices for Node 20–based action versions).

### Tooling — Node.js 24 — 2026-04-20

**Done**

- `engines.node` `>=24`; `@types/node` ^24; `.nvmrc` **24**; CI, Docs workflow, and Docker base images use Node 24; contributor and VitePress docs updated (including NodeSource `setup_24.x`).

### Docs — Raspberry Pi native + systemd — 2026-04-20

**Done**

- `docs/guide/raspberry-pi-native.md`: Node install, build deps, deploy under `/opt/inventory`, `.env`, dedicated user, systemd enable, updates, optional sidecar.
- `deploy/workbench-inventory.service` example unit; README and VitePress nav/sidebar links.

### Docs — hardware barcode scanner — 2026-04-20

**Done**

- New VitePress page `docs/guide/hardware-scanner.md` (serial/CDC mode, baud, line endings, Docker, verification); README and configuration guide cross-links; nav/sidebar entry.

### CI — GitHub Pages deploy via official Actions — 2026-04-20

**Done**

- Replaced `peaceiris/actions-gh-pages` with `actions/upload-pages-artifact` + `actions/deploy-pages` so deployments work when **Pages → Source** is **GitHub Actions** (fixes 404 when only the `gh-pages` branch was updated).

### Docs — VitePress base for GitHub Pages — 2026-04-20

**Done**

- Default `base` set to `/workbench-inventory/` for [bankersman/workbench-inventory](https://github.com/bankersman/workbench-inventory) Pages; GitHub link in theme; README points at the live docs URL.

### [Phase 11.3] Supporting repo files — 2026-04-20

**Done**

- `README.md`, `LICENSE` (MIT), `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`; changelog continues to be maintained manually (`CHANGELOG.md`).

### [Phase 11.2] Contribution guide — 2026-04-20

**Done**

- `CONTRIBUTING.md`: setup, PR checklist, extending suppliers, labels, categories, tests.

### [Phase 11.1] GitHub Pages site — 2026-04-20

**Done**

- VitePress site under `docs/` (`npm run docs:dev` / `docs:build`); workflow `.github/workflows/docs.yml` publishes to `gh-pages` with `VITEPRESS_BASE` set from the repository name.

### [Phase 10.4] Dockerfile — 2026-04-20

**Done**

- Multi-stage image: Node 24 build (native deps for canvas), runtime slim + Python sidecar deps; non-root `node` user; health check `GET /api/health`; entrypoint runs Flask sidecar + Nest.

### [Phase 10.3] Docker Compose — 2026-04-20

**Done**

- `docker-compose.yml` with data/backups volumes and ports 3000 / 5050.

### [Phase 10.2] GitHub Actions: Docker build and publish — 2026-04-20

**Done**

- `.github/workflows/docker-publish.yml`: build/push to `ghcr.io/${{ github.repository }}` on version tags `v*.*.*`, `linux/amd64` + `linux/arm64`.

### [Phase 10.1] GitHub Actions: CI pipeline — 2026-04-20

**Done**

- `.github/workflows/ci.yml`: parallel jobs for lint, typecheck, test (coverage artifact), build; native packages for canvas on Ubuntu runners.

**Considerations**

- Enable GitHub Pages from the `gh-pages` branch to serve the VitePress site; set the Pages “base” path to match `/repo-name/` if using a project site URL.

### [Phase 9.5] Second screen QA — 2026-04-20

**Done**

- Existing responsive rules retained; kiosk + touch navigation unchanged.

### [Phase 9.4] Resilience — 2026-04-20

**Done**

- `AppErrorBoundary` for API/render failures; Socket.IO client reconnection enabled; serial scanner reconnect already in `ScannerService`.

### [Phase 9.3] Inactivity timeout — 2026-04-20

**Done**

- Command mode resets after 30s idle; sticky toast in the last 5s (`useCommandState.inactiveWarn`).

### [Phase 9.2] Warning system — 2026-04-20

**Done**

- `WarningProvider`, `useWarning`, `WarningDialog` (ready for BOM/item warning flows).

### [Phase 9.1] Settings screen — 2026-04-20

**Done**

- `SettingsScreen`: categories list, scanner status, supplier env note, backup controls, label sidecar status, command sheet link.

### [Phase 8.3] Backup endpoints and Settings UI — 2026-04-20

**Done**

- Backup section on Settings; `GET /api/backup/status`, `POST /api/backup/run`, `GET /api/backup/download`.

### [Phase 8.2] Scheduler — 2026-04-20

**Done**

- `BackupScheduler` `@Cron('0 2 * * *')`; `ScheduleModule.forRoot()` in `AppModule`.

### [Phase 8.1] Backup service — 2026-04-20

**Done**

- `BackupService`: copy DB to `backups/inventory_YYYYMMDD.db`, prune older than 30 days, optional `NAS_PATH` rsync, `last_backup` in `app_settings`.

**Tests**

- `backup.service.spec.ts` — backups path.

### [Phase 7.4] Label UI — 2026-04-20

**Done**

- `LabelSection` on container, storage unit, and project detail screens (preview PNG + send to sidecar).

### [Phase 7.3] Label and command sheet endpoints — 2026-04-20

**Done**

- `POST /api/labels/preview`, `POST /api/labels/print`, `GET /api/labels/barcode.png`, `GET /api/labels/command-sheet`, `GET /api/labels/sidecar-status`.

### [Phase 7.2] Label service — 2026-04-20

**Done**

- `LabelService`: Code 128 via `bwip-js`, PNG layout via `canvas`; templates `bin-standard` / `bin-compact` / `storage-unit` / `project-bin`.

### [Phase 7.1] Python sidecar — 2026-04-20

**Done**

- `label-sidecar/sidecar.py` (Flask `:5050`), `requirements.txt`; decodes PNG and acknowledges print (hardware optional via `BROTHER_QL_PRINTER`).

**Tests**

- `label.service.spec.ts` — command code list.

**Considerations**

- `LABEL_SIDECAR_URL` defaults to `http://127.0.0.1:5050`.

### [Phase 6.5] Order list screen — 2026-04-20

**Done**

- `OrderListScreen`: low stock vs project gaps, reload, refresh prices, CSV export, Mouser/TME copy areas.

### [Phase 6.4] Batch refresh — 2026-04-20

**Done**

- `POST /api/order-list/refresh-prices` runs `SupplierRefreshService` (200ms between SKUs).

### [Phase 6.3] TME service — 2026-04-20

**Done**

- `TmeService.lookupBySku`: HMAC-SHA1 signing for `https://api.tme.eu/Products/Search`; uses `TME_APP_KEY` / `TME_APP_SECRET`.

### [Phase 6.2] Mouser service — 2026-04-20

**Done**

- `MouserService.lookupBySku` via Mouser search API; `MOUSER_API_KEY`.

### [Phase 6.1] Order list module — 2026-04-20

**Done**

- `GET /api/order-list` (low stock + project gaps), CSV and Mouser/TME pipe exports; `app_settings` migration for later settings consumers.

**Tests**

- `order-list-export.util.spec.ts` — CSV and pipe formats.

**Considerations**

- Supplier keys are read from environment variables (`MOUSER_API_KEY`, `TME_APP_KEY`, `TME_APP_SECRET`).

### [Phase 5.6] Project detail screen — 2026-04-20

**Done**

- `ProjectDetailScreen`: project metadata, BOM list with links to items, CSV export link.

### [Phase 5.5] Projects list screen — 2026-04-20

**Done**

- `ProjectsListScreen` lists `/api/projects`.

### [Phase 5.4] BOM and order list export — 2026-04-20

**Done**

- `GET /api/projects/:id/export/bom.csv` and `GET /api/projects/:id/export/missing.csv` (missing = `still_needed > 0`).

### [Phase 5.3] BOM import — 2026-04-20

**Done**

- `BomImportService.previewCsv`, `POST /api/projects/:id/bom/preview-import`, `POST /api/projects/:id/bom/confirm-import` (flexible column names: `name`/`item`/`qty`/`quantity`).

### [Phase 5.2] BOM module — 2026-04-20

**Done**

- BOM line CRUD under `/api/projects/:id/bom`; `GET .../bom/availability` combines lines with `AvailabilityService`.

### [Phase 5.1] Project module — 2026-04-20

**Done**

- Project CRUD; `POST /api/projects/:id/complete` applies PLAN completion stock adjustment; dependency `csv-parse`.

**Tests**

- `project.service.spec.ts` — CSV export shape.

**Considerations**

- Mouser/TME pipe shopping lists for a project are covered in Phase 6 shared export utilities (global order list).

### [Phase 4.7] Item detail screen — 2026-04-20

**Done**

- `ItemDetailScreen` loads item + `/api/availability/items/:id` and links to container.

### [Phase 4.6] Container detail screen — 2026-04-20

**Done**

- `ContainerDetailScreen` loads `/api/containers/:id` with storage unit / project links.

### [Phase 4.5] Storage unit detail screen — 2026-04-20

**Done**

- `StorageUnitDetailScreen` lists child containers from API.

### [Phase 4.4] Home screen — 2026-04-20

**Done**

- `HomeScreen` with quick links into inventory/projects.

### [Phase 4.3] Status bar — 2026-04-20

**Done**

- `StatusBar` shown when command state ≠ `IDLE`; cancel/confirm and ± stepper wired to `dispatchLine` / `adjustQty`.

### [Phase 4.2] Scanner hook and state machine — 2026-04-20

**Done**

- `useScanner` (Socket.IO kiosk, `useRef` callback); `commandStateMachine` + `useCommandState` (touch events + hardware); Vitest tests for reducer.

### [Phase 4.1] App shell — 2026-04-20

**Done**

- `BrowserRouter`, `AppLayout` with bottom nav (Home, Inventory, Projects, Order, Settings), dark-friendly layout CSS, 48px+ tap targets; Vite dev proxy for `/api` and `/socket.io`.

**Tests**

- `commandStateMachine.test.ts` (Vitest).

**Considerations**

- Global search / unknown-barcode registration flows are partial until later phases; detail routes assume seeded or manually created entities.

### [Phase 3.3] On-screen command palette — 2026-04-20

**Done**

- Home view FAB opens a modal grid of `CMD:*` and `QTY:*` actions; touch dispatches `workbench-scan-line` (`emitScanLine`) for parity with scanner-driven input.

**Tests**

- N/A (UI-only; no click E2E per PLAN).

**Considerations**

- Full command state machine is implemented in Phase 4.2; this step only exposes touch events on the same bridge later hooks consume.

### [Phase 3.2] WebSocket gateway — 2026-04-20

**Done**

- `ScannerGateway` on namespace `/ws/scanner`; `role` from `handshake.auth` / `query`; kiosk room receives `barcode` and `scanner_status`; `ping`/`pong`; `register` to switch role.
- `IoAdapter` registered in `main.ts`.

**Tests**

- Covered indirectly via scanner service unit tests; gateway wiring exercised at runtime.

**Considerations**

- Barcode events go only to the `kiosk` Socket.IO room.

### [Phase 3.1] Serial port service — 2026-04-20

**Done**

- `ScannerService`: disabled when `SCANNER_PORT` unset (info log); line buffering on `\r`/`\n`; exponential backoff reconnect; `isEnabled` / `isConnected`; `onLine` / `onHardwareStatus` for the gateway.

**Tests**

- `scanner.service.spec.ts` — `isEnabled` with/without env.

**Considerations**

- Requires real serial hardware to integration-test; CI stays headless.

### [Phase 2.6] Availability service — 2026-04-20

**Done**

- `AvailabilityService`: `getItemAvailability` / `getProjectAvailability` per PLAN derived fields (`inWarehouse`, `totalReserved`, `effectivelyFree`, `stillNeeded`); HTTP `GET /api/availability/items/:itemId` and `GET /api/availability/projects/:projectId`.

**Tests**

- `availability.service.spec.ts` — mocked aggregates for item availability and project line `stillNeeded`.

**Considerations**

- `getProjectAvailability` calls `getItemAvailability` per BOM line (N+1); acceptable for initial scale.

### [Phase 2.5] Unified scan resolution — 2026-04-20

**Done**

- `ScanModule`: `POST /api/scan/resolve` with `{ value }`; resolves `SU:`/`BIN:`/`PBIN:`/`PRJ:`/stored barcodes, `CMD:*`, `QTY:*`, and item packaging barcodes via `items.barcode`.

**Tests**

- `scan-resolve.service.spec.ts` — `CMD:`, `QTY:`, `PRJ:` resolution with mocked repositories.

**Considerations**

- `PBIN:` containers distinguished from `BIN:` only by stored barcode prefix; `PRJ:` uses numeric id (leading zeros allowed in the string).

### [Phase 2.4] Category module — 2026-04-20

**Done**

- `CategoryModule` CRUD at `/api/categories`; `assertValidCategoryAttributes()` validates PLAN attribute definition shape (`number` | `text` | `enum` + `options` for enums).

**Tests**

- `category-attributes.validator.spec.ts` — valid enum defs, invalid type, enum without options.

**Considerations**

- `CreateCategoryDto` defers deep attribute validation to the service so JSON shape errors return `400` with clear messages.

### [Phase 2.3] Item module — 2026-04-20

**Done**

- `ItemModule` CRUD at `/api/items`; list supports `q`, `categoryId`, `containerId`, `storageUnitId`, and `attr[key]=value` (bracket form) plus nested `attr` object; filters use `json_extract` + text cast for attribute equality.
- `POST /api/items/:id/adjust-quantity` with `{ delta, reason }`; rejects negative resulting stock.

**Tests**

- `item.service.spec.ts` — `parseAttrFromQuery`, adjustment rejection and success paths.

**Considerations**

- Free-text `q` strips `%` and `_` to avoid LIKE metacharacter injection/surprises.

### [Phase 2.2] Container module — 2026-04-20

**Done**

- `ContainerModule` CRUD at `/api/containers`; detail includes **storage unit** (`id`, `barcode`, `name`) and **project** (`id`, `name`, `status`) when FKs are set.
- Barcodes assigned as `BIN:` + zero-padded id (5 digits); validates `storageUnitId` / `projectId` when provided.

**Tests**

- `container.service.spec.ts` — `BadRequestException` when storage unit or project does not exist.

**Considerations**

- Same placeholder-then-final barcode pattern as storage units.

### [Phase 2.1] Storage unit module — 2026-04-20

**Done**

- `StorageUnitModule` with CRUD at `/api/storage-units`; `GET /api/storage-units/:id` returns the unit plus direct child **containers** in this storage unit (`id`, `barcode`, `name`).
- Barcodes assigned on create as `SU:` + zero-padded id (5 digits); `ValidationPipe` enabled globally (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Update rejects circular parent chains by walking ancestors of the proposed parent (`BadRequestException`).
- Dependency: `@nestjs/mapped-types` for `UpdateStorageUnitDto`.

**Tests**

- `storage-unit.service.spec.ts` — mocked repositories: cycle detection on update, successful reparent with detail response.

**Considerations**

- First save uses a unique placeholder barcode, then overwrites with the final `SU:` value (two writes per create).

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

- **Node version:** Target **Node.js 24+** (`package.json` `engines`, CI, Docker). Local dev with `nvm use 24` is supported.
- **`@nestjs/platform-socket.io`:** Not added yet; `socket.io` is installed for later WebSocket gateway work (Phase 3).
- **Static assets:** `ServeStaticModule` is only registered when `dist/frontend` exists (typically after `npm run build`), so `nest start` without a prior full build still runs API-only — intentional for backend-only dev.
