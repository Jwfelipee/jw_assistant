## Why

Operadores precisam compartilhar designações com a congregação (ex.: grupo de WhatsApp) sem exigir login. Hoje todo o app é privado — visitantes em qualquer URL são redirecionados para `/login`. Não há forma de publicar “esta semana”, “próxima semana”, “este mês” ou “próximo mês” de forma legível e read-only.

## What Changes

- **Quatro rotas públicas legíveis** no web app:
  - `/esta-semana` — designações da semana civil atual (ISO segunda–domingo), mesmo após o dia da reunião
  - `/proxima-semana` — designações da semana civil seguinte
  - `/este-mes` — todas as semanas do mês civil atual
  - `/proximo-mes` — todas as semanas do mês civil seguinte
- **API pública read-only** com DTO sanitizado (sem telefone, sem endpoints de mutação)
- **Controle por link**: cada URL pode ser desligada individualmente nas configurações; link desativado retorna página de “acesso indisponível” (404)
- **View mobile** com lista por seção/tópico; botão **Modo impressão** alterna para layout HTML próximo ao S-140
- **Seção em Configurações** para copiar cada link e ligar/desligar acesso

## Capabilities

### New Capabilities

- `public-schedule-links`: rotas públicas, API, resolução de semana/mês, view read-only e modo impressão

### Modified Capabilities

- `congregation-settings`: flags de habilitação por link público + UI de cópia

## Impact

- **Database** (`packages/database/prisma/schema.prisma`): 4 campos boolean em `CongregationSettings` (default `true`)
- **API** (`apps/api/src/`): novo módulo `public-schedule/` ou extensão de `schedule/` com endpoints `@Public()`
- **Shared** (`packages/shared/src/calendar/`): helpers `resolveIsoWeekBounds`, `resolveScheduleWeekForIsoWeek`
- **Web** (`apps/web/src/`): route group `(public)`, 4 páginas, componentes de lista e impressão, middleware
- **Settings** (`apps/web` + `apps/api`): toggles e cópia de URL

## Non-Goals

- Links com token/secreto opaco (URLs permanecem legíveis no domínio)
- Edição ou assign via páginas públicas
- Exportar PDF a partir da view pública (modo impressão usa `window.print` / CSS)
- Múltiplas congregações ou multi-tenant
- `noindex`/SEO avançado (pode ser follow-up)
