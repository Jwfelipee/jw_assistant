# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/api ./apps/api
# prisma generate does not need a live DB; placeholder URL is enough
ENV DATABASE_URL="postgresql://jw:jw@localhost:5432/jw_assistant?schema=public"
RUN pnpm --filter @jw/shared build \
  && pnpm --filter @jw/database build \
  && pnpm --filter api build

# One-shot migrate + seed (keeps prisma/tsx/bcryptjs from the full install)
FROM base AS migrate
ENV NODE_ENV=production
COPY --from=build /app /app
WORKDIR /app
CMD ["sh", "-c", "pnpm --filter @jw/database exec prisma migrate deploy && pnpm --filter @jw/database exec prisma db seed"]

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main.js"]
