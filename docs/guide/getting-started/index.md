# Getting started

The usual path is to **clone the repository** and run **Docker Compose** from the repo root. That builds the Nest API, React kiosk, SQLite data dirs, and the **optional** Python label sidecar (two services).

```bash
git clone https://github.com/bankersman/workbench-inventory.git
cd workbench-inventory
docker compose up --build
```

Open `http://localhost:3000`. Persisted files live under `./data` (database) and `./backups`.

## Other ways to run

| Approach | When to use |
| -------- | ----------- |
| [Docker (GHCR)](/guide/docker) | Pull pre-built multi-arch images, one-line `docker run`, or Compose without building locally |
| [Raspberry Pi (native)](/guide/raspberry-pi-native) | Systemd install on a Pi without Docker |
| [Local development](/guide/getting-started/local) | `npm run start:dev` + Vite while you change code |
| [Hardware](/guide/hardware/printers) · [USB scanner](/guide/hardware/scanner) | Label printing / Brother sidecar, or serial barcode scanner setup |

If you only need the **app image** (no label sidecar), use the **`docker run`** one-liner on [Docker (GHCR)](/guide/docker) — no Git checkout required.
