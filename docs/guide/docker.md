# Docker images (GHCR)

Tagged releases build **multi-arch** images (`linux/amd64`, `linux/arm64`) and push them to **GitHub Container Registry** (`ghcr.io`).

| Image | Purpose |
| ----- | ------- |
| `ghcr.io/bankersman/workbench-inventory` | NestJS app + static UI |
| `ghcr.io/bankersman/workbench-inventory-label-sidecar` | Python Flask label service |

Tags follow the release (for example `v0.0.1` → images tagged `0.0.1`, `0.0`, and `latest` on that release line).

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

To pass a device into the **app** service, extend the compose file with `devices`, `group_add`, and `SCANNER_PORT` as described in **[Hardware scanner](./hardware-scanner.md)**.

## Building from source instead

To build images locally from this repository, use the default `docker-compose.yml` and `docker compose up --build` — see **[Getting started](/guide/getting-started)**.
