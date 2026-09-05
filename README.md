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

### Portas (host → container)

| Serviço | Porta host | URL |
|---------|------------|-----|
| Web (Next.js) | 6010 | http://localhost:6010 |
| API (Nest) | 6011 | http://localhost:6011 |
| Postgres | 6012 | `localhost:6012` |

Login padrão (seed): `admin@example.com` / `changeme` (ajuste via `.env`).

O serviço `migrate` aplica `prisma migrate deploy` + seed uma vez; a API só sobe depois que ele termina com sucesso. O browser fala com a API via rewrite same-origin `/api` → serviço `api` na rede Docker.

### Health

```bash
curl http://localhost:6011/health
curl -I http://localhost:6010
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
