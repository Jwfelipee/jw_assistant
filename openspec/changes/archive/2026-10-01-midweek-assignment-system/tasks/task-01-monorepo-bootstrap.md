# Task 1 — Monorepo bootstrap

**Change:** `midweek-assignment-system`  
**Grupo:** 1 of 11  
**Pré-requisitos:** nenhum  
**Desbloqueia:** [2. Database schema and seed](./task-02-database-schema-and-seed.md)

## Objetivo do grupo

Deixar o monorepo compilável com Next (`apps/web`), Nest (`apps/api`), Prisma package e shared types, mais Postgres via Docker Compose.

## Contexto para o subagent

- Repositório greenfield: hoje só existem `README.md`, `S-140.docx` e `openspec/`.
- Decisões em `../design.md` (D1): pnpm + Turborepo; packages `@jw/database` e `@jw/shared`.
- Não implementar regras de negócio ainda — só scaffold.
- Idioma do código: TypeScript; UI futura em pt-BR.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `package.json` (root) | criar |
| `pnpm-workspace.yaml` | criar |
| `turbo.json` | criar |
| `apps/web/**` | criar (Next App Router) |
| `apps/api/**` | criar (NestJS) |
| `packages/shared/**` | criar |
| `packages/database/package.json` | criar (schema Prisma no grupo 2) |
| `docker-compose.yml` | criar |
| `.env.example` | criar |
| `.gitignore` | criar/atualizar |

---

## 1.1 — Initialize pnpm workspace + Turborepo

### O que fazer

- Inicializar root com `pnpm` workspaces: `apps/*`, `packages/*`.
- Adicionar Turborepo com pipelines `build`, `dev`, `lint`.
- Criar stubs de `packages/database` e `packages/shared` com `package.json` e `tsconfig`.

### Critérios de aceite

- [x] `pnpm install` no root funciona
- [x] `turbo run build` reconhece os packages (mesmo que vazios)

### Não fazer

- Não adicionar ainda schema Prisma completo nem módulos de domínio Nest

---

## 1.2 — Scaffold Next.js e NestJS

### O que fazer

- `apps/web`: Next.js App Router + TypeScript + Tailwind.
- `apps/api`: NestJS + TypeScript; health endpoint `GET /health` retornando `{ status: "ok" }`.
- Scripts `dev` em ambos apps.

### Critérios de aceite

- [x] `pnpm --filter web dev` sobe Next
- [x] `pnpm --filter api dev` sobe Nest e `/health` responde 200

### Não fazer

- Não configurar PWA ainda (grupo 11)
- Não implementar login ainda (grupo 3)

---

## 1.3 — Docker Compose Postgres + env examples

### O que fazer

- `docker-compose.yml` com Postgres 16, porta 5432, volume nomeado.
- `.env.example` na root e/ou por app com `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET` (ou session secret).

### Critérios de aceite

- [x] `docker compose up -d` sobe Postgres
- [x] `.env.example` documenta variáveis mínimas

### Não fazer

- Não commitar `.env` com segredos reais

---

## 1.4 — Path aliases e shared imports

### O que fazer

- Configurar `@jw/shared` exportando ao menos um enum placeholder (ex.: `Sex = MALE | FEMALE`).
- Garantir que `apps/api` e `apps/web` importam `@jw/shared` sem erro de build.

### Critérios de aceite

- [x] Import de `@jw/shared` funciona em api e web
- [x] Typecheck passa nos apps

### Não fazer

- Não mover lógica de negócio complexa para shared ainda

---

## Verificação do grupo

Rodar `pnpm install`, `docker compose up -d`, health check da API e page Next default.

## Handoff para próxima task

Monorepo pronto para Prisma schema em `packages/database` e seed.
