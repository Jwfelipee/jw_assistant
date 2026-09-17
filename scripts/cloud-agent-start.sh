#!/usr/bin/env bash
# Cloud Agent start: per-boot reconciliation. Brings PostgreSQL up and makes
# sure schema/seed exist (idempotent no-op when the snapshot already has them).
# The API and Web dev servers run as `terminals`, not here.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

bash scripts/cloud-agent-pg.sh up

# migrate deploy is a fast no-op when already applied; keeps a fresh data dir usable.
pnpm db:migrate
pnpm db:seed

echo "✓ Cloud Agent start complete."
