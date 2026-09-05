# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Rewrites in next.config are resolved at build time; use the Compose service name.
ARG API_ORIGIN=http://api:3001
ARG JWT_SECRET=change-me-to-a-long-random-string
ENV API_ORIGIN=$API_ORIGIN
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @jw/shared build \
  && pnpm --filter web build

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# Next standalone layout for monorepo: apps/web
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

WORKDIR /app/apps/web
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
