# USB barcode scanner

The kiosk can use a **USB barcode scanner**, but it is **fully optional**. Touch, mouse, and the on-screen command palette drive the same flows when no scanner is present.

## Why serial on the server (not HID or browser serial)

Scanners often offer **USB HID keyboard** (“keyboard wedge”) mode: each scan is injected as keystrokes into whatever window has focus. That is simple for a single desktop app, but it fits this project poorly:

- **Focus and context** — On a kiosk, focus can move between inputs, dialogs, or the command palette. Keystrokes follow the focused element, so scans can land in the wrong field or be mixed with real typing. There is no single, explicit “scan event” for the app to validate.
- **One pipeline** — The workshop flows (command codes, quantity, bin IDs) are interpreted in **one place** on the server, then broadcast over the existing **WebSocket** channel to every connected UI. HID mode would duplicate or fight with that pipeline if you also tried to read scans in the browser.
- **Operations** — Line-terminated **serial** reads map cleanly to “one scan = one line” for logging, debugging, and tests. The same path runs in Docker (pass `/dev/ttyUSB0` into the container) or on a native Pi install.

**Chromium [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)** could open the COM port from the frontend instead. We still prefer server-side serial because:

- **Permissions and deployment** — Web Serial needs a **secure context** (HTTPS or `localhost`) and user interaction to choose a port; on a wall-mounted Pi or locked-down kiosk, that UX is awkward compared to configuring `SCANNER_PORT` once on the server.
- **One attachment, many clients** — Multiple browser tabs or machines can view the UI; only the **API** should own the device so scans are not duplicated or split across clients.
- **Docker** — The common pattern is device passthrough to the **app** container, not to individual browsers inside it.

So: **serial/COM mode → Node `serialport` on the server → WebSocket to the kiosk** keeps behavior predictable for a workshop setting.

## What the server expects

The API opens the scanner as a **serial port** (Node `serialport`). That means the device must appear as a **virtual COM / USB CDC** device (sometimes labeled **USB-VCP** or **COM port emulation**), **not** as a USB HID keyboard (keyboard wedge).

| Setting      | Default               | Notes                                                               |
| ------------ | --------------------- | ------------------------------------------------------------------- |
| Baud rate    | `9600`                | Override with `SCANNER_BAUD` if you program the scanner differently |
| Line endings | `\r`, `\n`, or `\r\n` | Each scan must end with a line terminator; `\r\n` is a good default |
| Encoding     | UTF-8                 | Decoded as UTF-8 text per line                                      |

If the scanner is in **keyboard mode**, keystrokes go to the OS or browser — they are **not** read by the NestJS serial service. You need **serial/COM mode** for this app.

## Reference hardware (example)

The project spec references a **Datalogic Heron D130** (1D / linear imager). App barcodes use **Code 128** (full ASCII, including `CMD:TAKE`, `BIN:…`, etc.).

To switch a Datalogic (or similar) to USB serial, use the **programming barcodes in the manufacturer’s manual** or quick-reference sheet — model-specific symbols are not duplicated here (use the official booklet for your exact firmware).

**Typical programming goals:**

1. **USB CDC / virtual COM** (not HID keyboard).
2. **Suffix** after each read: carriage return + line feed (or at least LF), matching what the server splits on.
3. **Baud 9600** on the serial side, or set `SCANNER_BAUD` to match.

## Environment variables

| Variable       | Purpose                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `SCANNER_PORT` | Device path when serial is enabled, e.g. `/dev/ttyUSB0` (Linux), `COM3` (Windows native). If unset, the serial scanner is disabled. |
| `SCANNER_BAUD` | Baud rate (default `9600`).                                                                                                         |

## Checking that it works

- **Settings** in the UI shows scanner status via `GET /api/scanner/status` (`enabled` = `SCANNER_PORT` set, `connected` = serial port open).
- Server logs include messages like `Scanner serial opened: …` when the port opens successfully.

## Docker (Linux host)

Pass the host device into the container and set the same path inside:

```yaml
services:
  app:
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    group_add:
      - dialout
    environment:
      SCANNER_PORT: /dev/ttyUSB0
      SCANNER_BAUD: '9600'
```

Adjust `/dev/ttyUSB0` to your actual node (`ttyACM0`, a udev symlink, etc.). If permission is denied, ensure the container user can read the device (often `group_add: [dialout]` matches the host `dialout` group).

**Docker Desktop on macOS or Windows** does not support USB serial passthrough the same way as Linux. Run the stack on a **Linux** host (e.g. Raspberry Pi) for hardware serial, or use the touch/command palette only.

## Verifying scans

Use the printable **command sheet** at `/api/labels/command-sheet` (or **Settings → Command sheet** in the app). Any **Code 128** line the app understands (e.g. `CMD:CANCEL`, `QTY:10`) should appear as a single line event on the kiosk WebSocket when the serial reader is wired correctly.
