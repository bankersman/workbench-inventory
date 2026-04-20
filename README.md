# Workbench Inventory

NestJS API and React kiosk for workshop stock, BOM/projects, supplier shopping lists, labels, and SQLite backups. See [PLAN.md](./PLAN.md) for the full specification.

## Quickstart (Docker Compose)

```bash
git clone <your-remote-url>
cd workshop-inventory
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Persisted data lives in `./data` and backups in `./backups`.

## Documentation

- **Live site (GitHub Pages):** [https://bankersman.github.io/workbench-inventory/](https://bankersman.github.io/workbench-inventory/)
- **Local:** `npm run docs:dev` — open the URL Vite prints (includes the `/workbench-inventory/` base path). To build: `npm run docs:build`.
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

## License

MIT — see [LICENSE](./LICENSE).
