#!/usr/bin/env bash
set -euo pipefail

# Bootstrap PHP, Composer deps, DB, and Laravel Boost for imani-laravel.
# Run from repo root or imani-laravel/.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v php >/dev/null 2>&1; then
  echo "PHP 8.2+ is required. On Ubuntu/Pop!_OS:"
  echo "  sudo apt update && sudo apt install -y php8.3-cli php8.3-pgsql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip unzip"
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "Composer not found. Install with:"
  echo "  sudo apt install -y composer"
  echo "Or download: https://getcomposer.org/download/"
  exit 1
fi

echo "→ composer install"
composer install

echo "→ PHP extensions check"
php -m | grep -q pdo_sqlite && HAS_SQLITE=1 || HAS_SQLITE=0
php -m | grep -q pdo_pgsql && HAS_PGSQL=1 || HAS_PGSQL=0

if [[ "$HAS_SQLITE" -eq 0 && "$HAS_PGSQL" -eq 0 ]]; then
  echo "Install a DB driver: sudo apt install php8.3-sqlite3  (or php8.3-pgsql + postgresql)"
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  php artisan key:generate
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  php artisan key:generate --force
fi

# Default to SQLite for local dev when no Postgres is running
if [[ "$HAS_SQLITE" -eq 1 ]] && ! pg_isready -h 127.0.0.1 >/dev/null 2>&1; then
  touch database/database.sqlite
  if grep -q '^DB_CONNECTION=pgsql' .env; then
    sed -i 's/^DB_CONNECTION=pgsql/DB_CONNECTION=sqlite/' .env
    echo 'DB_DATABASE=database/database.sqlite' >> .env
    sed -i 's/^SESSION_DRIVER=database/SESSION_DRIVER=file/' .env
    sed -i 's/^CACHE_STORE=database/CACHE_STORE=file/' .env
    sed -i 's/^QUEUE_CONNECTION=database/QUEUE_CONNECTION=sync/' .env
  fi
fi

echo "→ migrate + seed (E2E needs demo data)"
php artisan migrate:fresh --seed --force

echo "→ Laravel Boost (interactive — pick Cursor + MCP + guidelines)"
php artisan boost:install

echo ""
echo "Done. Start the app:"
echo "  npm install && npm run build"
echo "  php artisan serve"
echo ""
echo "Run E2E:"
echo "  npx playwright install chromium"
echo "  npm run test:e2e"
