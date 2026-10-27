#!/usr/bin/env bash
#
# Run the whole app locally against SQLite, with no PostgreSQL and no Docker.
# Useful for a quick look, for template work, and for CI smoke runs.
#
#   ./scripts/dev_sqlite.sh            # migrate (once) + serve on :8000
#   PORT=9000 ./scripts/dev_sqlite.sh  # another port
#
# This is a developer convenience, not a production path. Production settings
# live in .env and docker-compose.prod.yml.
#
set -euo pipefail

cd "$(dirname "$0")/.."

PYTHON="${PYTHON:-python3}"
PORT="${PORT:-8000}"
DB="${DB_NAME:-$(pwd)/TestDB.sqlite3}"

# Placeholder values: adequate for localhost, never for a real deployment.
export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-horilla.settings}"
export DEBUG="${DEBUG:-True}"
export SECRET_KEY="${SECRET_KEY:-local-dev-only-not-a-real-secret}"
export ALLOWED_HOSTS="${ALLOWED_HOSTS:-*}"
export CSRF_TRUSTED_ORIGINS="${CSRF_TRUSTED_ORIGINS:-http://localhost:${PORT}}"
export DB_NAME="$DB"

echo "→ database : $DB_NAME"
echo "→ python   : $("$PYTHON" --version 2>&1)"

if [ ! -f "$DB_NAME" ]; then
    echo "→ first run: applying migrations (this takes a few minutes)"
    "$PYTHON" manage.py migrate --noinput
fi

echo "→ serving  : http://localhost:${PORT}"
exec "$PYTHON" manage.py runserver "0.0.0.0:${PORT}"
