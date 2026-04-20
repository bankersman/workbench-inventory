# Configuration

Environment variables (see also `.env.example` if present):

| Variable                         | Purpose                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `PORT`                           | HTTP port (default `3000`)                                                                               |
| `DB_PATH`                        | SQLite file path (default `./data/inventory.db`)                                                         |
| `SCANNER_PORT`                   | Serial device path when using a hardware scanner (e.g. `/dev/ttyUSB0`). Omit to disable serial scanning. |
| `SCANNER_BAUD`                   | Baud rate (default `9600`). Must match the scanner’s programmed speed.                                   |
| `MOUSER_API_KEY`                 | Mouser API key for price lookup                                                                          |
| `TME_APP_KEY` / `TME_APP_SECRET` | TME API credentials                                                                                      |
| `NAS_PATH`                       | Optional `rsync` destination for backups                                                                 |
| `LABEL_SIDECAR_URL`              | Python label sidecar base URL (Compose default: `http://label-sidecar:5050`)                             |
| `LABEL_SIDECAR_PORT`             | Sidecar listen port (default `5050`). Separate from `PORT` (main app).                                   |
| `BROTHER_QL_PRINTER`             | Optional printer identifier for the sidecar                                                              |

The kiosk WebSocket namespace is `/ws/scanner` with Socket.IO path `/socket.io`.

### Scanner details

The server reads **lines** over a **USB serial (CDC / virtual COM)** device — not USB HID keyboard mode. See **[USB barcode scanner](/guide/hardware/scanner)** for mode, line endings, Docker, and troubleshooting.
