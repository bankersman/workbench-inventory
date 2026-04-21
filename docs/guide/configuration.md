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
| `BROTHER_QL_BACKEND`             | `tcp` or `usb` — required for physical Brother QL printing (see **[Brother QL](/guide/hardware/printers)**) |
| `BROTHER_QL_MODEL`               | Brother QL model id (e.g. `QL-710W`)                                                                     |
| `BROTHER_QL_LABEL`               | Label / media id (e.g. `62`)                                                                             |
| `BROTHER_QL_HOST`                | TCP printer host (default `127.0.0.1`)                                                                   |
| `BROTHER_QL_PORT`                | TCP printer port (default `9100`)                                                                        |
| `BROTHER_QL_TIMEOUT_MS`          | Optional TCP print timeout (default `10000`)                                                             |

The kiosk WebSocket namespace is `/ws/scanner` with Socket.IO path `/socket.io`.

### Scanner details

The server reads **lines** over a **USB serial (CDC / virtual COM)** device — not USB HID keyboard mode. See **[USB barcode scanner](/guide/hardware/scanner)** for mode, line endings, Docker, and troubleshooting.
