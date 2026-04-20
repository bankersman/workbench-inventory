# Getting started

## Docker Compose (recommended)

From the repository root:

```bash
docker compose up --build
```

Open `http://localhost:3000`. Data is stored under `./data` and backups under `./backups` (see `docker-compose.yml`).

## Local development

Requires Node.js 22+ and npm. Install dependencies and run migrations (if needed), then start the API and frontend:

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

Set `LABEL_SIDECAR_URL` if not using the default `http://127.0.0.1:5050`.
