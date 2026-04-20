# Local development

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

Open the printed dev URL in your browser. The app is a React SPA (Tailwind CSS, TanStack Query) with routes such as `/inventory`, `/items`, `/projects`, and `/settings`. For a single-port setup with deep links, build the frontend and run the Nest server in production mode (see the repo README **Local development** section).

Lint, test, and build commands are on the [Development](/guide/development) page.

## Optional label sidecar (local Python)

For hardware label forwarding while developing:

```bash
pip install -r label-sidecar/requirements.txt
python label-sidecar/sidecar.py
```

Set `LABEL_SIDECAR_URL` if not using the default `http://127.0.0.1:5050`. The sidecar listens on `LABEL_SIDECAR_PORT` (default `5050`), not `PORT`. See [Printers & label sidecar](/guide/hardware/printers) for Docker and Brother QL context.
