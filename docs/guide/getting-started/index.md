# Getting started

The usual path is to **clone the repository** and run **Docker Compose** from the repo root. That builds the Nest API, React kiosk, and SQLite data dirs in a **single** container.

```bash
git clone https://github.com/bankersman/workbench-inventory.git
cd workbench-inventory
docker compose up --build
```

Open `http://localhost:3000`. Persisted files live under `./data` (database) and `./backups`.

## Other ways to run

| Approach                                                                      | When to use                                                                                  |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Docker (GHCR)](/guide/docker)                                                | Pull pre-built multi-arch images, one-line `docker run`, or Compose without building locally |
| [Raspberry Pi (native)](/guide/raspberry-pi-native)                           | Systemd install on a Pi without Docker                                                       |
| [Local development](/guide/getting-started/local)                             | `pnpm run start:dev` + Vite while you change code                                            |
| [Hardware](/guide/hardware/printers) · [USB scanner](/guide/hardware/scanner) | Brother QL printing, or serial barcode scanner setup                                         |

If you only need the **pre-built app image**, use the **`docker run`** one-liner on [Docker (GHCR)](/guide/docker) — no Git checkout required.
