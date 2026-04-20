# Configuration

Environment variables (see also `.env.example` if present):

| Variable                         | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `PORT`                           | HTTP port (default `3000`)                       |
| `DB_PATH`                        | SQLite file path (default `./data/inventory.db`) |
| `SCANNER_PORT`                   | Serial device path for hardware scanner          |
| `SCANNER_BAUD`                   | Baud rate (default `9600`)                       |
| `MOUSER_API_KEY`                 | Mouser API key for price lookup                  |
| `TME_APP_KEY` / `TME_APP_SECRET` | TME API credentials                              |
| `NAS_PATH`                       | Optional `rsync` destination for backups         |
| `LABEL_SIDECAR_URL`              | Python label sidecar base URL                    |
| `BROTHER_QL_PRINTER`             | Optional printer identifier for the sidecar      |

The kiosk WebSocket namespace is `/ws/scanner` with Socket.IO path `/socket.io`.
