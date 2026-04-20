# Workbench Inventory

NestJS API and React kiosk for workshop stock, BOM/projects, supplier shopping lists, labels, and SQLite backups. See [PLAN.md](./PLAN.md) for the full specification.

## Quickstart (Docker Compose)

```bash
git clone <your-remote-url>
cd workshop-inventory
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Persisted data lives in `./data` and backups in `./backups`.

### Optional USB barcode scanner

The app talks to a scanner as a **serial (USB CDC / COM) device** with **line-terminated** reads (default **9600 baud**). It is **not** the same as keyboard-wedge mode. Set `SCANNER_PORT` (and optionally `SCANNER_BAUD`) on the server; in Docker on Linux, pass through the host device (e.g. `/dev/ttyUSB0`). Full setup, Docker snippet, and verification steps are in the docs: **[Hardware scanner](https://bankersman.github.io/workbench-inventory/guide/hardware-scanner.html)** (same content in-repo: `docs/guide/hardware-scanner.md`).

### Raspberry Pi without Docker

To run **natively** on the Pi under **systemd** (typical for production kiosks with USB hardware), follow **[Raspberry Pi (native)](https://bankersman.github.io/workbench-inventory/guide/raspberry-pi-native.html)**. The repo includes `deploy/workbench-inventory.service` as a starting point.

## Documentation

- **Live site (GitHub Pages):** [https://bankersman.github.io/workbench-inventory/](https://bankersman.github.io/workbench-inventory/)
- **Pages setup:** In the repo **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”). The `Docs` workflow builds VitePress and deploys via `actions/deploy-pages`. If you previously used the `gh-pages` branch with another action, that branch is no longer required for publishing.
- **Local:** `npm run docs:dev` — open the URL Vite prints (includes the `/workbench-inventory/` base path). To build: `npm run docs:build`.
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

## License

MIT — see [LICENSE](./LICENSE).
