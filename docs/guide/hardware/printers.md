# Printers & label sidecar

Physical label printing is **optional**. The app always renders **Code 128** labels as **PNG** in the browser and via the API (`POST /api/labels/preview`). Sending a job to a **Brother QL** (or similar) goes through a small **Python sidecar** over HTTP.

## What is supported

- **In-app / API:** PNG label preview and barcode endpoints — no printer required.
- **Brother QL family:** The Python stack is built around [`brother_ql`](https://github.com/pklaus/brother_ql) (wired/network/USB depending on host setup). The repo’s sidecar decodes PNG payloads and is the integration point for real hardware; exact printer models follow what `brother_ql` supports on your OS.

Configure intent with:

| Variable             | Purpose                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `BROTHER_QL_PRINTER` | Optional printer identifier passed through to the sidecar for real deployments |

## Sidecar HTTP API

The Flask app (`label-sidecar/sidecar.py`) exposes:

| Method | Path      | Role                                                                                         |
| ------ | --------- | -------------------------------------------------------------------------------------------- |
| `GET`  | `/status` | Health — used by **Settings** and `BrotherQlService`                                         |
| `POST` | `/print`  | JSON body `{ "png_base64": "..." }` — decodes PNG and (when configured) forwards to hardware |

The Nest app calls the sidecar base URL from `LABEL_SIDECAR_URL` (default `http://127.0.0.1:5050`). The sidecar listens on **`LABEL_SIDECAR_PORT`** (default **5050**), not `PORT`.

## Docker images (GHCR)

Published alongside the main app:

- `ghcr.io/bankersman/workbench-inventory-label-sidecar`

Typical Compose wiring (see [Docker (GHCR)](/guide/docker)):

- Service **`label-sidecar`** from that image.
- **`LABEL_SIDECAR_URL=http://label-sidecar:5050`** on the app service.

You can run **only** the main image and skip the sidecar; preview still works, physical print returns an error until a sidecar is reachable. See the **App only** section in [Docker (GHCR)](/guide/docker).

## Native / Pi

Run the sidecar as a separate process or systemd unit and point `LABEL_SIDECAR_URL` at `http://127.0.0.1:5050` (or wherever it listens). The main Nest process does not start Python for you on native installs — see [Raspberry Pi (native)](/guide/raspberry-pi-native).
