#!/usr/bin/env bash
set -euo pipefail
export NODE_NO_WARNINGS=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

DEPLOY_DIR="${DEPLOY_DIR:-$PROJECT_ROOT/dist}"
SKIP_TESTS="${SKIP_TESTS:-0}"
START="${START:-0}"
NO_START="${NO_START:-0}"

echo "[deploy] Preparing environment..."
bash "$SCRIPT_DIR/setup.sh"

if [ "$SKIP_TESTS" != "1" ]; then
    echo "[deploy] Running tests..."
    node --test testing/unit/*.test.js testing/integration/*.test.js
fi

echo "[deploy] Building production directory: $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

cp -R "$PROJECT_ROOT/backend" "$DEPLOY_DIR/backend"
cp -R "$PROJECT_ROOT/frontend" "$DEPLOY_DIR/frontend"
cp "$PROJECT_ROOT/package.json" "$DEPLOY_DIR/package.json"
if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
    cp "$PROJECT_ROOT/package-lock.json" "$DEPLOY_DIR/package-lock.json"
fi

mkdir -p "$DEPLOY_DIR/release"
cp "$SCRIPT_DIR/init-db.mjs" "$DEPLOY_DIR/release/init-db.mjs"
cp "$SCRIPT_DIR/serve-frontend.mjs" "$DEPLOY_DIR/release/serve-frontend.mjs"

cd "$DEPLOY_DIR"
echo "[deploy] Installing production dependencies..."
npm install --omit=dev

echo "[deploy] Initializing production database..."
node release/init-db.mjs

if [ "$START" = "1" ] && [ "$NO_START" != "1" ]; then
    echo "[deploy] Starting server..."
    nohup node backend/server/main.mjs > server.log 2>&1 &
    echo $! > server.pid
    echo "[deploy] Server started with PID $(cat server.pid)"
else
    echo "[deploy] Deployment ready. Nothing was started."
    echo "[deploy] Start it with: cd \"$DEPLOY_DIR\" && node backend/server/main.mjs"
fi

echo "[deploy] Serve the frontend with Apache or another static server from: $DEPLOY_DIR/frontend"
