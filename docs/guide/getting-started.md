# Getting started

## Docker Compose (recommended)

From the repository root:

```bash
docker compose up --build
```

Open `http://localhost:3000`. Data is stored under `./data` and backups under `./backups` (see `docker-compose.yml`).

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
