# Changelog

## [Unreleased]

### Frontend — category attributes UI (step 1) — 2026-04-21

**Done**

- Added shared frontend category attribute typings in [`frontend/src/types/category.ts`](frontend/src/types/category.ts) to mirror backend `Category.attributes` schema (`number` / `text` / `enum` with optional enum `options`).

### Frontend — category attributes UI (step 2) — 2026-04-21

**Done**

- Category create/edit screens now include a custom-attribute editor (`key`, `label`, `type`, optional `unit`, enum `options`) and submit `attributes` in category `POST`/`PATCH` payloads with client-side validation for required fields, key format, uniqueness, and enum options.
- Added frontend tests in [`frontend/src/screens/CategoryScreens.test.tsx`](frontend/src/screens/CategoryScreens.test.tsx) covering attribute row add/remove behavior, duplicate-key validation, enum options payload formatting, and edit-screen patch payloads.

### Frontend — category attributes UI (step 3) — 2026-04-21

**Done**

- Item create/edit screens now render dynamic **Category fields** from the selected category schema and persist item `attributes` in `POST /items` and `PATCH /items/:id` payloads, including number coercion and reset-on-category-change behavior.
- Added focused tests in [`frontend/src/screens/ItemAttributeForms.test.tsx`](frontend/src/screens/ItemAttributeForms.test.tsx) for number/text/enum payload coercion, category-change resets, and edit-form initialization from existing attribute values.

### Frontend — category attributes UI (step 4) — 2026-04-21

**Done**

- Added a **Specifications** section to part detail pages that maps category attribute definitions to stored item values, including unit suffixes and null placeholders.
- Added fallback key/value rendering when category metadata is unavailable but item attributes exist.
- Added tests in [`frontend/src/screens/ItemDetailScreen.test.tsx`](frontend/src/screens/ItemDetailScreen.test.tsx) for category-based rendering and fallback behavior.

### Frontend — category attributes UI (step 5) — 2026-04-21

**Done**

- Settings category rows now show the number of custom fields defined for each category (e.g. `0 fields`, `3 fields`) to make schema coverage visible at a glance.

### Docs — category attributes UI (final step) — 2026-04-21

**Done**

- Updated [`PLAN.md`](PLAN.md) to reflect shipped behavior: category attribute-definition editing in Settings, dynamic category-driven item create/edit fields with persisted `attributes`, and the item-detail **Specifications** rendering/fallback behavior.

### Tooling — pnpm workspace — 2026-04-21

**Done**

- **Package manager:** Switched the monorepo from npm workspaces to **pnpm** (`pnpm-workspace.yaml`, root `packageManager` pin, `pnpm-lock.yaml`). Root scripts use `pnpm --filter frontend …` where the frontend package is involved. **Dockerfile** and **GitHub Actions** (`ci.yml`, `docs.yml`) install with `pnpm install --frozen-lockfile`; prod image stage runs `pnpm prune --prod` after the build `node_modules` copy. Docs (**README**, **CONTRIBUTING**, getting started, development, Raspberry Pi native, PR template) and **PLAN.md** CI/delivery commands updated accordingly; **`package-lock.json`** is gitignored; **`.prettierignore`** lists `pnpm-lock.yaml`.

### Frontend — top shell, page structure, bookmarkable routes — 2026-04-21

**Done**

- **Layout:** Replaced bottom nav + `AppFooter` with a **sticky header** (`AppHeader`: title, main nav including **Parts** `/items`, theme **switch** with sun/moon icons, **GitHub** mark link). `StatusBar` + idle banner stay above the header; `main` padding adjusted; command FAB sits at safe-area bottom.
- **Page shell:** Added `PageHero` / `PageBody` / `SectionCard` ([`PageShell.tsx`](frontend/src/components/PageShell.tsx)) and applied across Home, lists, Order, Settings, inventory/detail screens for clearer hero vs body and card-style sections.
- **Order list:** Restructured into action card, optional shopping-list card, and separate **Low stock** / **Project gaps** panels with badges and clearer controls ([`OrderListScreen.tsx`](frontend/src/screens/OrderListScreen.tsx)).
- **Routes:** Static paths registered before `:id` segments in [`App.tsx`](frontend/src/App.tsx): new storage unit (`/inventory/new`), storage unit edit, new container under a unit, container edit, item edit/adjust, project create/edit, BOM line create/edit, category create/edit under `settings/categories/…`. List/detail screens link to these routes; category create/edit modals removed from Settings (delete confirm kept).

### Fix — SPA deep links (ServeStatic exclude) — 2026-04-21

**Done**

- **[ServeStaticModule](src/app.module.ts):** `exclude` changed from `'/api*'` to **`'/api/{*path}'`**. Express 5’s `path-to-regexp` rejects `*`-only globs; the old value threw on every SPA path (`/order`, `/projects`, …), yielding **500 JSON** instead of `index.html`.

### Docs — PLAN.md workshop UI (full overhaul plan) — 2026-04-21

**Done**

- **[PLAN.md](PLAN.md):** Major **Workshop UI — frontend overhaul (shipped application layer)** section—principles and visual direction from the overhaul spec, technical architecture (**Tailwind**, **TanStack Query**, **`apiBase`/`fetchJson`**, SPA static), theme/shell/GitHub, user-journeys table, **phases 0–7** summary, client **route** table, file references, risks; mermaid diagram; **Frontend Screens** intro distinguishes **shipped UI** vs **full kiosk target**; **Settings** and **Inventory Browser** callouts for what the repo ships today; **Implementation roadmap** Phase 4 Step 4.1 and **Unit Testing** bullets aligned with the shipped stack.

### Frontend overhaul — Phase 7 — 2026-04-21

**Done**

- **Docs alignment:** [README.md](README.md) **Web UI** subsection; [PLAN.md](PLAN.md) tech stack row for Tailwind + TanStack Query; [progress.md](progress.md) links [progress-frontend-overhaul.md](progress-frontend-overhaul.md); [local dev](docs/guide/getting-started/local.md) notes SPA routes and single-port build.

### Frontend overhaul — Phase 6 — 2026-04-21

**Done**

- **A11y:** Bottom nav links get visible **focus** rings; **main** landmark `id="main-content"` with `tabIndex={-1}` for programmatic focus; command palette **close** control has an accessible name.
- **Tests:** [Vitest](frontend/src/api.test.ts) coverage for [`parseApiErrorMessage`](frontend/src/api.ts) (Nest JSON shapes and fallbacks).

### Frontend overhaul — Phase 5 — 2026-04-21

**Done**

- **Categories:** [SettingsScreen](frontend/src/screens/SettingsScreen.tsx) — list with **New category**, **Rename**, **Delete** (plain-language confirm); TanStack Query + invalidation; backup/scanner/labels sections unchanged aside from coexistence.

### Frontend overhaul — Phase 4 — 2026-04-21

**Done**

- **Parts list:** [ItemsListScreen](frontend/src/screens/ItemsListScreen.tsx) — search `q`, filters (category, storage unit, container), shareable query string; links to detail and bin.
- **Create part:** [ItemCreateScreen](frontend/src/screens/ItemCreateScreen.tsx) at `/items/new` with optional `?containerId=`; home and container detail link in with defaults.
- **Part detail:** [ItemDetailScreen](frontend/src/screens/ItemDetailScreen.tsx) — availability block; **adjust quantity** (delta + reason, before/after feedback); **edit** (bin, category, reorder levels, etc.); **delete** with confirm.
- **Routes:** `/items`, `/items/new`, `/items/:id` (static routes ordered before `:id`).

### Frontend overhaul — Phase 3 — 2026-04-21

**Done**

- **Inventory hub:** [InventoryScreen](frontend/src/screens/InventoryScreen.tsx) — **Add storage area** (name, optional parent, notes); navigates to the new unit.
- **Storage unit:** [StorageUnitDetailScreen](frontend/src/screens/StorageUnitDetailScreen.tsx) — Tailwind layout; **edit** name/parent/notes; **delete** with plain-language confirm; **New bin** (`POST /containers` with `storageUnitId`); list of bins; labels.
- **Container:** [ContainerDetailScreen](frontend/src/screens/ContainerDetailScreen.tsx) — location + project summary; **edit** bin (storage unit + optional project + notes); **delete** with confirm (blocked when parts still reference the bin); TanStack Query + invalidation.

### Frontend overhaul — Phase 2 — 2026-04-21

**Done**

- **Projects list:** [ProjectsListScreen](frontend/src/screens/ProjectsListScreen.tsx) — **New project** modal, `POST /projects`, status at a glance, TanStack invalidation + navigation to detail.
- **Project detail / BOM:** [ProjectDetailScreen](frontend/src/screens/ProjectDetailScreen.tsx) — edit project; delete/complete with confirmations; BOM **add / edit / remove**; **availability** via `GET .../bom/availability`; **CSV import** (preview → confirm); export BOM and missing-links; separate loading/error for BOM vs project header.
- **API client:** [`fetchJson`](frontend/src/api.ts) handles **204** and empty bodies; **`fetchNoContent`** for no-body success responses.

### Frontend overhaul — Phase 1 — 2026-04-21

**Done**

- **Tailwind CSS v4** with Vite plugin; **`dark`** class variant; semantic CSS variables for legacy [`App.css`](frontend/src/App.css) (command palette) until full migration.
- **Theme:** [`ThemeProvider`](frontend/src/theme/ThemeProvider.tsx), [`useTheme`](frontend/src/theme/useTheme.ts), **localStorage** `workbench-theme`, **`prefers-color-scheme`** default; **Light/Dark** toggle in the [AppHeader](frontend/src/components/AppHeader.tsx) (`ThemeToggle`); Settings points users to the header control.
- **GitHub** link in footer to [bankersman/workbench-inventory](https://github.com/bankersman/workbench-inventory).
- **TanStack Query:** [`queryClient`](frontend/src/queryClient.ts), lists on [Projects](frontend/src/screens/ProjectsListScreen.tsx) and [Inventory](frontend/src/screens/InventoryScreen.tsx).
- **Shell:** [AppLayout](frontend/src/AppLayout.tsx), [StatusBar](frontend/src/StatusBar.tsx), bottom nav, [Home](frontend/src/screens/HomeScreen.tsx) restyled; [`index.html`](frontend/index.html) title **Workbench Inventory**.
- **README:** [Local development](README.md) (Nest + Vite vs production static).

### Frontend overhaul — Phase 0 — 2026-04-21

**Done**

- **SPA deep links:** [`ServeStaticModule`](src/app.module.ts) sets explicit `renderPath: '{*any}'` so full page loads to client routes (e.g. `/projects`) serve `index.html`.
- **API errors:** [`parseApiErrorMessage`](frontend/src/api.ts) + [`fetchJson`](frontend/src/api.ts) surface Nest JSON `message` / `error` instead of raw blobs.
- **Order list:** [`OrderListScreen`](frontend/src/screens/OrderListScreen.tsx) uses [`apiBase()`](frontend/src/api.ts) for `/order-list` (works with `VITE_API_BASE`).
- **Progress tracker:** [`progress-frontend-overhaul.md`](progress-frontend-overhaul.md) checklist for phases 0–7.

### Docs — scanner design rationale — 2026-04-21

**Done**

- `docs/guide/hardware/scanner.md`: why serial is opened on the server (vs HID wedge and Chromium Web Serial).

### Docs — Getting started + Hardware IA — 2026-04-21

**Done**

- **Getting started** nav: **Overview** landing (`docker compose up --build`), links to Docker (GHCR), Pi, and **Local development** (`guide/getting-started/local.md`).
- **Hardware** nav: **Printers & label sidecar** (`guide/hardware/printers.md`), **USB barcode scanner** (`guide/hardware/scanner.md`); removed flat `hardware-scanner.md` (no redirects).

### Docs — Docker app-only one-liner — 2026-04-21

**Done**

- Lead with copy-pastable `docker run` (no repo); removed `docker-compose.app-only.yml`; README shows the same one-liner before Compose.

### Docs — VitePress nav & home — 2026-04-21

**Done**

- Top nav: **Install & run** dropdown; **Usage** in nav; sidebar grouped to match.
- Home: hero art (`docs/public/hero-icon.svg`), richer tagline, three CTAs, six feature cards with icons, **Quick links** table.

### Docs — GHCR pull/run — 2026-04-20

**Done**

- `docker-compose.ghcr.yml` to run published images without building; new VitePress page `docs/guide/docker.md` (pull, pin tags, `ghcr.io` login, non-root volumes); README and getting-started updated with links.
- Document optional label sidecar; app-only via a single **`docker run`** one-liner (no compose file); removed `docker-compose.app-only.yml`.

### Docker — distroless split images — 2026-04-20

**Done**

- **App** image: `gcr.io/distroless/nodejs24-debian12:nonroot`; native addons (`canvas`, `better-sqlite3`) ship extra `.so` libraries via `scripts/collect-distroless-libs.sh`; health check uses Node `fetch` (no `curl`).
- **Label sidecar** image: `label-sidecar/Dockerfile` on `gcr.io/distroless/python3-debian12:nonroot`; Flask deps installed in a build stage and copied into the runtime image.
- `docker-compose.yml`: `app` + `label-sidecar` services; `LABEL_SIDECAR_URL=http://label-sidecar:5050`; removed monolithic shell entrypoint.
- **GHCR**: workflow publishes `ghcr.io/<repo>` and `ghcr.io/<repo>-label-sidecar` with the same version tags.

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

- VitePress site under `docs/` (`pnpm run docs:dev` / `docs:build`); workflow `.github/workflows/docs.yml` publishes to `gh-pages` with `VITEPRESS_BASE` set from the repository name.

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

- Monorepo with pnpm workspace `frontend/` (Vite + React + TypeScript) and NestJS backend at repo root (`src/`).
- Root scripts: `lint`, `format`, `format:check`, `test` (Jest + Vitest), `test:watch`, `test:cov`, `typecheck`, `build`, `start`, `start:dev`, `start:prod`.
- Strict TypeScript via `tsconfig.base.json` (backend `tsconfig.json`, frontend extends base in `tsconfig.app.json`).
- ESLint 9 flat config (`eslint.config.mjs`) with TypeScript rules for `src/` and React hooks / refresh for `frontend/`; Prettier via `eslint-config-prettier` and `.prettierrc` (PLAN.md excluded from formatting).
- TypeORM + `better-sqlite3`: database path from `DB_PATH`, default `${cwd}/data/inventory.db`; `PRAGMA journal_mode=WAL` on startup (`DatabaseInitService`).
- `@nestjs/serve-static` serves `dist/frontend` when present (after `pnpm run build`); API under global prefix `/api`.
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
- **Static assets:** `ServeStaticModule` is only registered when `dist/frontend` exists (typically after `pnpm run build`), so `nest start` without a prior full build still runs API-only — intentional for backend-only dev.
