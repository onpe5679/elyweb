#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"

echo "=== Studio Elysian Deployment ==="
echo "Project: $PROJECT_DIR"
echo "Docker: $DOCKER_DIR"
echo ""

cd "$PROJECT_DIR"

echo "[1/5] Pulling latest changes..."
git pull origin main

echo "[2/5] Loading environment variables..."
if [ -f "$DOCKER_DIR/.env" ]; then
    export $(cat "$DOCKER_DIR/.env" | grep -v '^#' | xargs)
else
    echo "ERROR: $DOCKER_DIR/.env not found!"
    echo "Copy .env.example to .env and configure it."
    exit 1
fi

echo "[3/5] Building Docker images..."
cd "$DOCKER_DIR"
docker compose build --no-cache

echo "[4/5] Stopping old containers..."
docker compose down

echo "[5/5] Starting new containers..."
docker compose up -d

echo ""
echo "=== Deployment Complete ==="
docker compose ps
echo ""
echo "Web: http://localhost:3000"
echo "Admin: http://localhost:3001"
echo ""
