# Raspberry Pi (native, systemd)

This guide runs the app **directly on Raspberry Pi OS** with **systemd** — no Docker. Use this when you want tight integration with USB devices (scanner, printer), minimal overhead, or a layout that matches `/opt/inventory` in the project spec.

Docker Compose remains a good option for development or x86 machines; see [Getting started](./getting-started.md).

## Overview

- **One process:** `node dist/main.js` serves the NestJS API and the built Vite app from `dist/frontend`.
- **Database:** SQLite file on disk (default under `./data` or set `DB_PATH`).
- **Migrations:** Applied automatically on startup (`migrationsRun: true` in the app).

## 1. Install Node.js (22+)

Use a **system-wide** Node so `systemd` can run `/usr/bin/node` (or adjust `ExecStart` in the unit file).

Example using [NodeSource](https://github.com/nodesource/distributions) (check their docs for current commands):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should be v22.x
```

Alternatively install [nvm](https://github.com/nvm-sh/nvm) for your login user only — then you **must** set `ExecStart` to the full path of `node` from `which node` in that environment, or use a small wrapper script.

## 2. System packages for native modules

The project uses native addons (`better-sqlite3`, `canvas`, `serialport`, etc.). On Debian / Raspberry Pi OS:

```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  python3 \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev
```

## 3. Deploy files

Pick an install root, e.g. `/opt/inventory`. Clone the repository **into** that directory (it must be empty or a fresh folder):

```bash
sudo mkdir -p /opt/inventory
sudo chown "$USER:$USER" /opt/inventory
cd /opt/inventory
git clone https://github.com/bankersman/workbench-inventory.git .
npm ci
npm run build
npm prune --omit=dev
```

Create data directories (paths must match `DB_PATH`):

```bash
mkdir -p data backups
```

## 4. Environment file

Create `/opt/inventory/.env` (example):

```bash
NODE_ENV=production
PORT=3000
DB_PATH=/opt/inventory/data/inventory.db
# Optional hardware scanner (see Hardware scanner guide):
# SCANNER_PORT=/dev/ttyUSB0
# SCANNER_BAUD=9600
```

See [Configuration](./configuration.md) for all variables.

## 5. Dedicated user (recommended)

Run the service as a non-login user. Give it a separate home (not the app tree), then hand ownership of `/opt/inventory` to that user:

```bash
sudo useradd --system \
  --create-home \
  --home-dir /var/lib/workbench-inventory \
  --shell /usr/sbin/nologin \
  inventory
sudo chown -R inventory:inventory /opt/inventory
```

## 6. systemd service

Copy the unit from the repository and enable it:

```bash
sudo cp /opt/inventory/deploy/workbench-inventory.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now workbench-inventory
```

Edit `/etc/systemd/system/workbench-inventory.service` if your paths or Node binary differ (`WorkingDirectory`, `ExecStart`, `User`).

Useful commands:

```bash
sudo systemctl status workbench-inventory
journalctl -u workbench-inventory -f
```

Open the kiosk in a browser on the Pi: `http://127.0.0.1:3000` (or the Pi’s LAN IP).

## 7. Kiosk browser (optional)

The app does not install a full-screen browser by itself. Typical approaches: Chromium in kiosk mode started by `systemd` or `autologin`, pointing at `http://localhost:3000`. That is environment-specific; see your OS documentation.

## 8. Updates

```bash
cd /opt/inventory
sudo -u inventory git pull
sudo -u inventory npm ci
sudo -u inventory npm run build
sudo -u inventory npm prune --omit=dev
sudo systemctl restart workbench-inventory
```

## 9. Optional: label sidecar

If you use the Python Brother sidecar on the same Pi, run it separately (another systemd unit or process) and set `LABEL_SIDECAR_URL` in `.env` (e.g. `http://127.0.0.1:5050`). The main app does not start Python for you.
