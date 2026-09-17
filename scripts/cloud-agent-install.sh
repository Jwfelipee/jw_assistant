#!/usr/bin/env bash
# Cloud Agent install: prepare a native (Docker-free) dev environment.
# Idempotent — runs once at build time (captured in the snapshot) or during
# just-in-time agent setup. Long-running dev servers live in `terminals`.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. PostgreSQL system package + running cluster + role/database.
bash scripts/cloud-agent-pg.sh up

# 2. Local env files (git-ignored) — generated only if missing.
if [ ! -f .env ]; then
  cat > .env <<'EOF'
POSTGRES_USER=jw
POSTGRES_PASSWORD=jw
POSTGRES_DB=jw_assistant
DATABASE_URL=postgresql://jw:jw@localhost:5432/jw_assistant?schema=public

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
CONGREGATION_NAME=Congregação (placeholder)
MEETING_WEEKDAY=THURSDAY

JWT_SECRET=dev-local-secret-change-me-please-32chars

PORT=3001
WEB_ORIGIN=http://localhost:3000
COOKIE_SECURE=false

API_ORIGIN=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
fi

if [ ! -f apps/web/.env.local ]; then
  cat > apps/web/.env.local <<'EOF'
JWT_SECRET=dev-local-secret-change-me-please-32chars
API_ORIGIN=http://localhost:3001
EOF
fi

# 3. Workspace dependencies.
pnpm install --frozen-lockfile

# 4. Build shared/database packages and generate the Prisma client
#    (dev servers import their compiled dist output).
pnpm --filter @jw/shared build
pnpm --filter @jw/database build

# 5. Apply migrations + idempotent seed.
pnpm db:migrate
pnpm db:seed

echo "✓ Cloud Agent install complete."
