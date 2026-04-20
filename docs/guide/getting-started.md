# Getting started

## Docker Compose (recommended)

### Build from source (repository root)

```bash
docker compose up --build
```

### Run published images (GHCR)

If you only want pre-built images (no `npm` / local Docker build), use `docker-compose.ghcr.yml`:

```bash
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

To skip the label sidecar entirely, use **`docker-compose.app-only.yml`** or a `docker run` one-liner—see **[Docker (GHCR)](./docker.md)**.

See that page for image names, version tags, registry login, host permissions for the non-root containers, and when the sidecar is optional.

Open `http://localhost:3000`. Both stacks use two services (Nest app + label sidecar on 5050) and the same volume layout: `./data` and `./backups` (see `docker-compose.yml` or `docker-compose.ghcr.yml`).

To use a **USB serial barcode scanner** with Docker on Linux, configure `SCANNER_PORT` and pass the host device into the container — see **[Hardware scanner](./hardware-scanner.md)**.

For a **native systemd install on a Raspberry Pi** (no Docker), see **[Raspberry Pi (native)](./raspberry-pi-native.md)**.

## Local development

Requires Node.js 24+ and npm (see repo root `.nvmrc` if you use **nvm**). Install dependencies and run migrations (if needed), then start the API and frontend:

```bash
npm install
npm run migration:run
npm run start:dev
```

In another terminal:

```bash
cd frontend && npm run dev
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:3000`.

## Optional label sidecar

```bash
pip install -r label-sidecar/requirements.txt
python label-sidecar/sidecar.py
```

Set `LABEL_SIDECAR_URL` if not using the default `http://127.0.0.1:5050`. The sidecar listens on `LABEL_SIDECAR_PORT` (default `5050`), not `PORT`.
