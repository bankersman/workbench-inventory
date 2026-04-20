#!/bin/sh
set -e

mkdir -p /opt/inventory/data /opt/inventory/backups

python3 /opt/inventory/label-sidecar/sidecar.py &

exec node /opt/inventory/dist/main.js
