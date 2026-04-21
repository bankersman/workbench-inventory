# Local development

Requires Node.js 24+ and **pnpm** (see `package.json` `packageManager`; enable with `corepack enable` on Node 16+). See repo root `.nvmrc` if you use **nvm**. Install dependencies and run migrations (if needed), then start the API and frontend:

```bash
pnpm install
pnpm run migration:run
pnpm run start:dev
```

In another terminal:

```bash
pnpm --filter frontend run dev
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:3000`.

Open the printed dev URL in your browser. The app is a React SPA (Tailwind CSS, TanStack Query) with routes such as `/inventory`, `/items`, `/projects`, and `/settings`. For a single-port setup with deep links, build the frontend and run the Nest server in production mode (see the repo README **Local development** section).

Lint, test, and build commands are on the [Development](/guide/development) page.

## Brother QL printing

Physical printing uses **`@brother-ql/node`** in the Nest process. Set **`BROTHER_QL_*`** in the environment (see [Brother QL label printing](/guide/hardware/printers) and [Configuration](/guide/configuration)).
