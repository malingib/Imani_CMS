#!/usr/bin/env bash
# Install PHP DB driver for local dev (pick one).
set -euo pipefail

echo "Install SQLite driver (recommended for local dev):"
echo "  sudo apt install -y php8.3-sqlite3"
echo ""
echo "Or PostgreSQL:"
echo "  sudo apt install -y php8.3-pgsql postgresql postgresql-contrib"
echo "  sudo systemctl enable --now postgresql"
echo "  sudo -u postgres createuser -s \$USER 2>/dev/null || true"
echo "  createdb imani_cms 2>/dev/null || true"
echo ""
echo "Then from imani-laravel/:"
echo "  php artisan migrate:fresh --seed"
echo "  npm run test:e2e"
