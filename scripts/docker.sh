#!/usr/bin/env bash
# Comandos Docker Compose com rebuild parcial e BuildKit habilitado.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export DOCKER_BUILDKIT=1
export COMPOSE_BAKE=true

compose() {
  docker compose "$@"
}

usage() {
  cat <<'EOF'
Uso: pnpm run <script>  ou  bash scripts/docker.sh <comando> [serviços...]

Comandos (via scripts/docker.sh):
  up                  Sobe a stack sem rebuild
  up:build            Build completo + sobe tudo (primeira vez / lockfile)
  down                Para a stack
  build [serviços]    Só constrói imagem(ns)
  redeploy [serviços] Build + recria container(s) — use após mudar código
  migrate             Roda migrate + seed (schema/seed)
  logs [serviço]      Segue logs (web, api, db…)
  ps                  Status dos serviços

Scripts npm/pnpm mais usados:
  pnpm run build:web       → redeploy só web (~2–5 min)
  pnpm run build:api       → redeploy só api (~2–4 min)
  pnpm run build:api:web   → redeploy api + web
  pnpm run docker:up       → sobe sem rebuild (segundos)
  pnpm run build:docker    → build completo + sobe tudo
  pnpm run docker:migrate  → migrations após mudar Prisma
EOF
}

cmd="${1:-}"
shift || true

case "$cmd" in
  up)
    compose up -d "$@"
    ;;
  up:build)
    compose up -d --build "$@"
    ;;
  down)
    compose down "$@"
    ;;
  build)
    if [ $# -eq 0 ]; then
      compose build
    else
      compose build "$@"
    fi
    ;;
  redeploy)
    if [ $# -eq 0 ]; then
      echo "redeploy exige ao menos um serviço: web, api" >&2
      exit 1
    fi
    echo "→ Build: $*"
    compose build "$@"
    echo "→ Recriando containers: $*"
    compose up -d --no-deps --force-recreate "$@"
    echo "✓ Pronto. Web: http://localhost:6010 · API: http://localhost:6011/health"
    ;;
  migrate)
    compose up -d db
    compose run --rm migrate
    ;;
  logs)
    compose logs -f "$@"
    ;;
  ps)
    compose ps
    ;;
  help | -h | --help)
    usage
    ;;
  "")
    usage >&2
    exit 1
    ;;
  *)
    echo "Comando desconhecido: $cmd" >&2
    usage >&2
    exit 1
    ;;
esac
