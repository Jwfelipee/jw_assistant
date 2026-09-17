#!/usr/bin/env bash
# Native PostgreSQL helpers for the Cloud Agent environment (no Docker).
# Idempotent: safe to call from both `install` (build time) and `start` (boot).
set -euo pipefail

PG_VER="${PG_VER:-16}"
PG_CLUSTER="${PG_CLUSTER:-main}"
DB_USER="${POSTGRES_USER:-jw}"
DB_PASS="${POSTGRES_PASSWORD:-jw}"
DB_NAME="${POSTGRES_DB:-jw_assistant}"

ensure_installed() {
  if ! command -v pg_ctlcluster >/dev/null 2>&1; then
    sudo apt-get update
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      postgresql postgresql-contrib
  fi
}

start_cluster() {
  # pg_ctlcluster returns non-zero if the cluster is already running; tolerate it.
  sudo pg_ctlcluster "$PG_VER" "$PG_CLUSTER" start 2>/dev/null || true
  # Wait until the server accepts connections.
  for _ in $(seq 1 30); do
    if sudo -u postgres pg_isready -q; then
      return 0
    fi
    sleep 1
  done
  echo "PostgreSQL did not become ready in time" >&2
  return 1
}

ensure_db() {
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END \$\$;
SQL
  if ! sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
  fi
}

case "${1:-}" in
  ensure-installed) ensure_installed ;;
  start)            start_cluster ;;
  ensure-db)        ensure_db ;;
  up)               ensure_installed && start_cluster && ensure_db ;;
  *)
    echo "Usage: $0 {ensure-installed|start|ensure-db|up}" >&2
    exit 1
    ;;
esac
