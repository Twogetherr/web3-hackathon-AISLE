#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
PRISMA_SCHEMA="$ROOT_DIR/prisma/schema.prisma"

required_env_vars=(
  OPENAI_API_KEY
  DATABASE_URL
  AVALANCHE_RPC_URL
  AVALANCHE_FUJI_RPC_URL
  AVALANCHE_CHAIN_ID
  AVALANCHE_FUJI_CHAIN_ID
  USDC_CONTRACT_ADDRESS
  USDC_FUJI_CONTRACT_ADDRESS
  MERCHANT_WALLET_ADDRESS
  MERCHANT_WALLET_PRIVATE_KEY
  PORT
  VITE_API_BASE_URL
  NODE_ENV
  RATE_LIMIT_WINDOW_MS
  RATE_LIMIT_MAX_REQUESTS
)

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

missing_env=()

for env_var in "${required_env_vars[@]}"; do
  if [[ -z "${!env_var:-}" ]]; then
    missing_env+=("$env_var")
  fi
done

if (( ${#missing_env[@]} > 0 )); then
  printf 'Missing required env vars:\n' >&2
  printf ' - %s\n' "${missing_env[@]}" >&2
  exit 1
fi

if [[ ! -f "$SERVER_DIR/.env" ]]; then
  cp "$ROOT_DIR/.env" "$SERVER_DIR/.env"
fi

if [[ ! -f "$CLIENT_DIR/.env" ]]; then
  printf 'VITE_API_BASE_URL=%s\n' "$VITE_API_BASE_URL" > "$CLIENT_DIR/.env"
fi

printf '[root] Installing dependencies\n'
npm install

printf '[server] Generating Prisma client\n'
(cd "$SERVER_DIR" && npx prisma generate --schema "$PRISMA_SCHEMA")

db_ready=false

if command -v psql >/dev/null 2>&1; then
  db_name="$(printf '%s\n' "$DATABASE_URL" | sed -E 's#.*/([^/?]+)(\?.*)?$#\1#')"
  db_exists="$(
    psql "$DATABASE_URL" -tAc "SELECT 1" 2>/dev/null || true
  )"

  if [[ "$db_exists" != "1" ]]; then
    admin_url="${DATABASE_URL%/*}/postgres"
    if psql "$admin_url" -tAc "SELECT 1 FROM pg_database WHERE datname='${db_name}'" | grep -q 1; then
      printf '[db] Database %s already exists\n' "$db_name"
    else
      printf '[db] Creating database %s\n' "$db_name"
      psql "$admin_url" -c "CREATE DATABASE \"$db_name\""
    fi
  fi

  printf '[server] Running Prisma migrations\n'
  (cd "$SERVER_DIR" && npx prisma migrate dev --schema "$PRISMA_SCHEMA" --name aisle_local_bootstrap)

  printf '[server] Seeding database\n'
  (cd "$SERVER_DIR" && npm run prisma:seed)

  db_ready=true
else
  printf '[db] psql not found. Skipping database creation, migrations, and seed. Backend demo fallback will be used.\n'
fi

cleanup() {
  jobs -p | xargs -r kill >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

printf '[server] Starting dev server on http://localhost:%s\n' "$PORT"
(
  cd "$SERVER_DIR"
  npm run dev 2>&1 | sed 's/^/[server] /'
) &

printf '[client] Starting dev server on http://localhost:5173\n'
(
  cd "$CLIENT_DIR"
  npm run dev -- --host 0.0.0.0 2>&1 | sed 's/^/[client] /'
) &

if [[ "$db_ready" == true ]]; then
  printf '[root] Full Prisma-backed path is active\n'
else
  printf '[root] Running in local demo mode with in-memory backend fallback\n'
fi

wait
