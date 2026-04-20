# Docker images (GHCR)

Tagged releases build **multi-arch** images (`linux/amd64`, `linux/arm64`) and push them to **GitHub Container Registry** (`ghcr.io`).

| Image                                                  | Purpose                    |
| ------------------------------------------------------ | -------------------------- |
| `ghcr.io/bankersman/workbench-inventory`               | NestJS app + static UI     |
| `ghcr.io/bankersman/workbench-inventory-label-sidecar` | Python Flask label service |

Tags follow the release (for example `v0.0.1` → images tagged `0.0.1`, `0.0`, and `latest` on that release line).

## Label sidecar is optional

You can run **only** the main app image. Inventory, UI, barcode **preview**, and API features work without Python. The sidecar is only needed to **forward label print jobs** to optional Brother QL hardware (`POST /api/labels/print`). If no sidecar is reachable, Settings shows the sidecar as not ready and print-to-printer returns an error; everything else keeps working.

## App only — one line (no repo clone)

From any directory on a machine with Docker, create data directories and run (pulls the image on first use):

```bash
mkdir -p data backups && docker run --rm -p 3000:3000 -v "$(pwd)/data:/opt/inventory/data" -v "$(pwd)/backups:/opt/inventory/backups" -e PORT=3000 -e DB_PATH=/opt/inventory/data/inventory.db ghcr.io/bankersman/workbench-inventory:latest
```

Open `http://localhost:3000`. Stop with **Ctrl+C**; `./data` and `./backups` on the host keep your database and backups.

- **Different host port** (e.g. **8787**): use `-p 8787:3000` and open `http://localhost:8787` — the app still listens on port **3000 inside** the container.
- **Pin a version:** replace `:latest` with `:<version>` (e.g. `:0.0.1`).
- **Detached server:** swap `--rm` for `-d --name workbench-inventory` and stop later with `docker stop workbench-inventory`.

## Pull and run (Compose)

You do **not** need the Git repo—only Compose and a working directory for volumes.

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

Open `http://localhost:3000` in a browser. The database file is under `./data` and backups under `./backups`, same as the [build-from-source](/guide/getting-started/) compose file.

The Compose file includes **both** the app and the **label sidecar**. To run **without** the sidecar, use the [one-line `docker run`](#app-only-one-line-no-repo-clone) above instead of Compose.

### Pin a version

Edit `docker-compose.ghcr.yml` (or use [overrides](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)) so each `image:` ends with a specific tag, for example `ghcr.io/bankersman/workbench-inventory:0.0.1` and `ghcr.io/bankersman/workbench-inventory-label-sidecar:0.0.1`. Use the **same tag** on both services.

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

To pass a device into the **app** service, extend the compose file with `devices`, `group_add`, and `SCANNER_PORT` as described in **[USB barcode scanner](/guide/hardware/scanner)**.

## Building from source instead

To build images locally from this repository, use the default `docker-compose.yml` and `docker compose up --build` — see **[Getting started](/guide/getting-started/)**.
