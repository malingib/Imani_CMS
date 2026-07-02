#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

red() { printf '\033[0;31m%s\033[0m\n' "$*"; }
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }

has_sqlite() { php -m | grep -q pdo_sqlite; }
has_pgsql() { php -m | grep -q pdo_pgsql; }

if ! has_sqlite; then
  if ! has_pgsql; then
    red "No PHP database driver found."
    echo "Run ONE of:"
    echo "  sudo apt install -y php8.3-sqlite3"
    echo "  sudo apt install -y php8.3-pgsql docker.io docker-compose-v2"
    exit 1
  fi

  if command -v docker >/dev/null 2>&1 && ! docker compose ps postgres 2>/dev/null | grep -q running; then
    echo "→ Starting Postgres via Docker..."
    docker compose up -d postgres
    sleep 5
  fi

  if grep -q '^DB_CONNECTION=sqlite' .env 2>/dev/null; then
    sed -i 's/^DB_CONNECTION=sqlite/DB_CONNECTION=pgsql/' .env
    for kv in DB_HOST=127.0.0.1 DB_PORT=5432 DB_DATABASE=imani_cms DB_USERNAME=imani DB_PASSWORD=imani; do
      key="${kv%%=*}"
      if grep -q "^${key}=" .env; then
        sed -i "s/^${key}=.*/${kv}/" .env
      else
        echo "$kv" >> .env
      fi
    done
  fi
fi

echo "→ migrate:fresh --seed"
php artisan migrate:fresh --seed --force

echo "→ npm run build"
npm run build

if ! npx playwright --version >/dev/null 2>&1; then
  echo "→ playwright install chromium"
  npx playwright install chromium
fi

echo "→ E2E tests"
npm run test:e2e

green "Setup complete."
