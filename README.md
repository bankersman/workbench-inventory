# Workbench Inventory

NestJS API and React kiosk for workshop stock, BOM/projects, supplier shopping lists, labels, and SQLite backups. See [PLAN.md](./PLAN.md) for the full specification.

## Quickstart (Docker Compose)

**Build from this repo** (for development or customization):

```bash
git clone <your-remote-url>
cd workshop-inventory
docker compose up --build
```

**Run the app image only** (no Git clone; optional label sidecar omitted):

```bash
mkdir -p data backups && docker run --rm -p 3000:3000 -v "$(pwd)/data:/opt/inventory/data" -v "$(pwd)/backups:/opt/inventory/backups" -e PORT=3000 -e DB_PATH=/opt/inventory/data/inventory.db ghcr.io/bankersman/workbench-inventory:latest
```

**Compose (app + label sidecar)** — copy [`docker-compose.ghcr.yml`](./docker-compose.ghcr.yml) from this repo or use a checkout:

```bash
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

More detail (custom host port, pinning versions, `ghcr.io` login, volume permissions) is in **[Docker (GHCR)](https://bankersman.github.io/workbench-inventory/guide/docker.html)** ([`docs/guide/docker.md`](./docs/guide/docker.md)).

Open [http://localhost:3000](http://localhost:3000). Compose runs two **distroless** services (Nest app + Python label sidecar on port 5050). Persisted data lives in `./data` and backups in `./backups`.

### Optional USB barcode scanner

The app talks to a scanner as a **serial (USB CDC / COM) device** with **line-terminated** reads (default **9600 baud**). It is **not** the same as keyboard-wedge mode. Set `SCANNER_PORT` (and optionally `SCANNER_BAUD`) on the server; in Docker on Linux, pass through the host device (e.g. `/dev/ttyUSB0`). Full setup, Docker snippet, and verification steps are in the docs: **[USB barcode scanner](https://bankersman.github.io/workbench-inventory/guide/hardware/scanner.html)** (in-repo: `docs/guide/hardware/scanner.md`).

### Raspberry Pi without Docker

To run **natively** on the Pi under **systemd** (typical for production kiosks with USB hardware), follow **[Raspberry Pi (native)](https://bankersman.github.io/workbench-inventory/guide/raspberry-pi-native.html)**. The repo includes `deploy/workbench-inventory.service` as a starting point.

## Local development (API + Vite)

From the repo root: `npm ci`, then run the Nest API (`npm run start:dev`, default port **3000**) and in another terminal the Vite dev server (`npm run dev --workspace frontend`, default **5173**). Vite proxies `/api` and `/socket.io` to the API. Open the Vite URL for hot reload; for **production-like** deep links (`/projects`, `/items`, etc.) on one port, run `npm run build` and `npm run start:prod` so Nest serves [`dist/frontend`](frontend/vite.config.ts).

### Web UI (kiosk app)

The React SPA is styled with **Tailwind CSS** and loads server state via **TanStack Query**. It includes a bottom nav shell, light/dark theme (Settings or footer), and task-oriented flows: **Inventory** (storage areas and bins), **Parts** (search, create, adjust stock), **Projects** (BOM, CSV import/export, completion), **Order** (reorder list), and **Settings** (categories, backup, scanner/sidecar status).

## Documentation

- **Live site (GitHub Pages):** [https://bankersman.github.io/workbench-inventory/](https://bankersman.github.io/workbench-inventory/)
- **Pages setup:** In the repo **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”). The `Docs` workflow builds VitePress and deploys via `actions/deploy-pages`. If you previously used the `gh-pages` branch with another action, that branch is no longer required for publishing.
- **Local:** `npm run docs:dev` — open the URL Vite prints (includes the `/workbench-inventory/` base path). To build: `npm run docs:build`.
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

## License

MIT — see [LICENSE](./LICENSE).
