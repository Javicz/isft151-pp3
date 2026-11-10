#!/usr/bin/env bash
set -euo pipefail
export NODE_NO_WARNINGS=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "[setup] Node.js version:"
node --version

if [ "${SKIP_INSTALL:-0}" != "1" ]; then
    echo "[setup] Installing dependencies..."
    npm install
fi

echo "[setup] Initializing database..."
node release/init-db.mjs

echo "[setup] Environment ready."
