# Brother QL label printing

Physical label printing is **optional**. The app always renders **Code 128** labels as **PNG** in the browser and via the API (`POST /api/labels/preview`). Sending a job to a **Brother QL** on the network or USB uses [**`@brother-ql/node`**](https://www.npmjs.com/package/@brother-ql/node) inside the Nest server (no separate process).

## What is supported

- **In-app / API:** PNG label preview and barcode endpoints — no printer required.
- **Brother QL hardware:** The server builds printer commands from your PNG using `@brother-ql/node` (TCP to port **9100** by default, or USB on supported hosts). Valid **`BROTHER_QL_MODEL`** and **`BROTHER_QL_LABEL`** pairs follow the [supported hardware and media](https://bankersman.github.io/brother-ql-node/guide/supported-hardware-and-media) documentation for that library.

Label artwork is rendered at **720×360** px (standard) or **560×220** px (compact template). Choose a tape / label id that fits your media and matches the model.

## Environment variables

| Variable                 | Purpose                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `BROTHER_QL_BACKEND`     | `tcp` or `usb`. Required for physical printing.                                                           |
| `BROTHER_QL_MODEL`       | Printer model id (for example `QL-710W`).                                                                 |
| `BROTHER_QL_LABEL`       | Label / media id (for example `62`).                                                                      |
| `BROTHER_QL_HOST`        | TCP host (default `127.0.0.1`).                                                                           |
| `BROTHER_QL_PORT`        | TCP port (default `9100`).                                                                                |
| `BROTHER_QL_TIMEOUT_MS`  | Optional print timeout for TCP (default `10000`).                                                         |

Settings calls **`GET /api/labels/printer-status`**, which reports whether the Brother QL environment looks configured and (for TCP) whether a connection to `host:port` succeeds.

## Docker and networking

The published image is a **single** distroless Node service. For a printer on your LAN, set `BROTHER_QL_HOST` to the printer’s IP (or use `host` networking / `extra_hosts` if the printer is on the Docker host). **USB** from inside a container usually needs device passthrough and is more practical on a **native** install; prefer **TCP** for Docker.

See [Docker (GHCR)](/guide/docker) for pulling and running the app image.

## Native / Pi

On a Raspberry Pi or other native install, set the same variables in `.env` or the systemd unit environment. See [Raspberry Pi (native)](/guide/raspberry-pi-native).
