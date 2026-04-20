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

- **User & developer guide (VitePress):** build with `npm run docs:build`, or after enabling GitHub Pages on the `gh-pages` branch, browse the site published from this repo’s **Docs** workflow.
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

## License

MIT — see [LICENSE](./LICENSE).
