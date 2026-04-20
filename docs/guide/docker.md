# Docker images (GHCR)

Tagged releases build **multi-arch** images (`linux/amd64`, `linux/arm64`) and push them to **GitHub Container Registry** (`ghcr.io`).

| Image | Purpose |
| ----- | ------- |
| `ghcr.io/bankersman/workbench-inventory` | NestJS app + static UI |
| `ghcr.io/bankersman/workbench-inventory-label-sidecar` | Python Flask label service |

Tags follow the release (for example `v0.0.1` → images tagged `0.0.1`, `0.0`, and `latest` on that release line).

## Label sidecar is optional

You can run **only** the main app image. Inventory, UI, barcode **preview**, and API features work without Python. The sidecar is only needed to **forward label print jobs** to optional Brother QL hardware (`POST /api/labels/print`). If no sidecar is reachable, Settings shows the sidecar as not ready and print-to-printer returns an error; everything else keeps working.

## Pull and run (Compose)

You do **not** need the Git repo to run published images—only Compose and a working directory for volumes.

From any empty folder (or alongside a checkout), create `data` and `backups` if they do not exist, then:

```bash
docker compose -f /path/to/docker-compose.ghcr.yml pull
docker compose -f /path/to/docker-compose.ghcr.yml up -d
```

If you cloned the repository, from the repo root:

```bash
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

Open `http://localhost:3000` in a browser. The database file is under `./data` and backups under `./backups`, same as the [build-from-source](/guide/getting-started) compose file.

To run **without** the sidecar service, use **`docker-compose.app-only.yml`** or **`docker run`** (see sections below).

### Pin a version

Edit `docker-compose.ghcr.yml` (or use [overrides](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)) so each `image:` ends with a specific tag, for example `ghcr.io/bankersman/workbench-inventory:0.0.1` and `ghcr.io/bankersman/workbench-inventory-label-sidecar:0.0.1`. Use the **same tag** on both services. For app-only, set the tag on `docker-compose.app-only.yml`’s single `image:` line (or pass the tag to `docker run`).

## App only (Compose, no sidecar)

From the repo root (or with `-f` pointing at this file):

```bash
docker compose -f docker-compose.app-only.yml pull
docker compose -f docker-compose.app-only.yml up -d
```

Same volumes and port as the full GHCR compose file; there is no `label-sidecar` service and no `depends_on`.

## App only (`docker run`)

Single-container run with persisted DB and backups on the host (no Compose, no sidecar):

```bash
mkdir -p data backups
docker pull ghcr.io/bankersman/workbench-inventory:latest

docker run -d --name workbench-inventory \
  -p 3000:3000 \
  -v "$(pwd)/data:/opt/inventory/data" \
  -v "$(pwd)/backups:/opt/inventory/backups" \
  -e PORT=3000 \
  -e DB_PATH=/opt/inventory/data/inventory.db \
  ghcr.io/bankersman/workbench-inventory:latest
```

- **Port:** `-p 3000:3000` maps the HTTP API and UI (change the first `3000` if the host port is busy).
- **Volumes:** database and backups must stay on mounted paths so data survives container recreation.
- **Sidecar:** omitted on purpose. The default `LABEL_SIDECAR_URL` inside the image points at `127.0.0.1:5050` inside the same container, where nothing is listening—so printer forwarding is disabled until you add a sidecar (Compose or a second `docker run` on the same Docker network).

To stop and remove: `docker stop workbench-inventory && docker rm workbench-inventory`.

## Authentication

- **Public** packages: `docker pull` works without logging in.
- **Private** packages: log in with a GitHub personal access token that includes the **`read:packages`** scope:

  ```bash
  echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
  ```

## Containers and users

Images use **distroless** runtimes and run as **non-root** (UID **65532**). If bind-mounted `./data` is not writable, fix ownership on the host, for example:

```bash
sudo chown -R 65532:65532 data backups
```

## USB serial scanner

To pass a device into the **app** service, extend the compose file with `devices`, `group_add`, and `SCANNER_PORT` as described in **[Hardware scanner](./hardware-scanner.md)**.

## Building from source instead

To build images locally from this repository, use the default `docker-compose.yml` and `docker compose up --build` — see **[Getting started](/guide/getting-started)**.
