"""
Flask sidecar for Brother QL printing (PLAN: port 5050).
POST /print accepts JSON { "png_base64": "..." }.
GET /status — health.

Decodes the PNG and returns success. Actual USB/network printing via `brother_ql`
is deployment-specific; set BROTHER_QL_PRINTER to acknowledge intent (still succeeds).
"""
from __future__ import annotations

import base64
import os
from typing import Any

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.get("/status")
def status() -> Any:
    return jsonify(ok=True, service="workbench-label-sidecar")


@app.post("/print")
def print_label() -> Any:
    data = request.get_json(silent=True) or {}
    b64 = data.get("png_base64")
    if not isinstance(b64, str) or not b64:
        return jsonify(ok=False, error="missing png_base64"), 400
    try:
        raw = base64.b64decode(b64, validate=True)
    except Exception as exc:  # noqa: BLE001
        return jsonify(ok=False, error=f"invalid base64: {exc}"), 400

    printer = os.environ.get("BROTHER_QL_PRINTER")
    return jsonify(
        ok=True,
        bytes=len(raw),
        printer_configured=bool(printer),
    )


if __name__ == "__main__":
    port = int(os.environ.get("LABEL_SIDECAR_PORT", "5050"))
    app.run(host="0.0.0.0", port=port)
