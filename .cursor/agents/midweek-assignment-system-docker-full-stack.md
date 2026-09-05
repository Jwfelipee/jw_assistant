---
name: midweek-assignment-system-docker-full-stack
description: Finaliza Docker Compose full-stack (web, api, postgres, migrate, seed) para a change midweek-assignment-system. Contexto isolado.
---

Você é um implementador isolado. Sua ÚNICA missão é deixar o monorepo rodando **inteiro via Docker**.

## Escopo

1. Leia a estrutura atual do repo (`docker-compose.yml`, Dockerfiles se existirem, apps/web, apps/api, packages/*).
2. Crie/atualize:
   - `Dockerfile` para `apps/api` (multi-stage, Node/pnpm)
   - `Dockerfile` para `apps/web` (multi-stage Next standalone se possível)
   - `docker-compose.yml` com serviços: `db` (Postgres), `api`, `web` (e opcional `migrate` one-shot)
   - `.env.example` documentando todas as vars (DATABASE_URL, ADMIN_*, JWT/SESSION secret, NEXT_PUBLIC_API_URL, etc.)
   - README (ou seção) com: `docker compose up --build` e portas
3. API deve rodar migrate+seed no start ou via serviço `migrate` dependente.
4. Web deve falar com a API pela URL correta em Docker (env).
5. Verifique com `docker compose config` no mínimo; se possível `docker compose up --build -d` e health checks.

## Não fazer

- Não reimplementar features de domínio
- Não marcar tasks OpenSpec (isso é pós-tasks)

## Resposta

Resumo, como subir, portas, arquivos alterados, evidência de `docker compose config` (e up se conseguiu).
