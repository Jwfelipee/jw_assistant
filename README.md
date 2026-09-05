# jw_assistant

Monorepo do sistema de designações da reunião do meio de semana (Nest API + Next.js + Prisma/Postgres).

## Subir com Docker (recomendado)

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up --build
```

Em background:

```bash
docker compose up --build -d
```

### Portas

| Serviço | Porta host | URL |
|---------|------------|-----|
| Web (Next.js) | 3000 | http://localhost:3000 |
| API (Nest) | 3001 | http://localhost:3001 |
| Postgres | 5432 | `localhost:5432` |

Login padrão (seed): `admin@example.com` / `changeme` (ajuste via `.env`).

O serviço `migrate` aplica `prisma migrate deploy` + seed uma vez; a API só sobe depois que ele termina com sucesso. O browser fala com a API via rewrite same-origin `/api` → serviço `api` na rede Docker.

### Health

```bash
curl http://localhost:3001/health
curl -I http://localhost:3000
```

Parar:

```bash
docker compose down
```

## Desenvolvimento local (sem Docker das apps)

1. Suba só o banco: `docker compose up -d db`
2. Copie `.env.example` → `.env` e `apps/web/.env.local` (JWT_SECRET + API_ORIGIN)
3. `pnpm install`
4. `pnpm db:migrate && pnpm db:seed`
5. `pnpm dev`
