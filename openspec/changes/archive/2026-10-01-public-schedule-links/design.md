## Context

Exploração anterior mapeou o estado atual:

- Middleware Next.js só libera `/login`; API NestJS tem decorator `@Public()` mas schedule não usa
- `getMonth(yearMonth)` já retorna `MonthView` completo (semanas, partes, slots com nome **e telefone**)
- `currentYearMonth()` e `addMonths()` existem em `@jw/shared`
- Não há resolução de “semana atual/próxima” — semanas são navegadas por `weekId` dentro do mês
- PDF S-140 (`apps/api/src/pdf/s140-model.ts`, `s140-document.tsx`) já modela layout tabular fiel; pode servir de referência para o modo impressão HTML
- `CongregationSettings` é singleton (`id = 1`) com `name` e `meetingWeekday`

Decisões do usuário:

1. **Semana atual** = semana civil ISO (segunda–domingo) de hoje, **mesmo se o dia da reunião já passou**
2. Slots vazios = exibir `—` (travessão)
3. Links **totalmente abertos**, mas o operador pode **desligar cada link** individualmente
4. **Lista mobile** + opção **modo impressão** com visual próximo ao S-140

## Goals / Non-Goals

**Goals:**

- 4 URLs fixas em português, sem acento, compartilháveis
- Read-only, sem vazamento de telefone ou IDs de mutação
- Toggle por link em Configurações + botão copiar URL
- Resolução correta de semana ISO e mês civil, inclusive virada de mês/ano
- Modo impressão HTML reutilizando a mesma estrutura lógica do S-140

**Non-Goals:**

- Autenticação opcional nos links públicos
- Rate limiting / analytics de acesso
- PWA offline para páginas públicas

## Decisions

### D1 — Definição de “semana atual” e “próxima semana”

Usar **semana civil ISO** (segunda 00:00 → domingo 23:59, fuso local do servidor/cliente):

```typescript
// packages/shared/src/calendar/iso-week.ts

function isoWeekBoundsForDate(date: Date): { start: Date; end: Date }

function meetingDateInRange(meetingDate: Date, start: Date, end: Date): boolean
```

**Semana atual**: `ScheduleWeek` cuja `meetingDate` cai dentro dos bounds da semana ISO de `now`.

**Próxima semana**: `ScheduleWeek` cuja `meetingDate` cai dentro dos bounds da semana ISO imediatamente seguinte (`start + 7 dias`).

Racional: alinhado à decisão do usuário — na sexta após a reunião de quinta, `/esta-semana` ainda mostra aquela reunião (meetingDate ainda está na semana ISO corrente).

Se não existir semana no banco para o intervalo: retornar payload com `weeks: []` e mensagem amigável (não 404, exceto se link desabilitado).

Busca cross-month: consultar semanas por `meetingDate` entre `start` e `end` (query Prisma), sem depender do mês civil da `weekStartDate`.

### D2 — Definição de “este mês” e “próximo mês”

- **Este mês**: `currentYearMonth(now)` → reutilizar `getMonth(yearMonth)` existente
- **Próximo mês**: `addMonths(currentYearMonth(now), 1)` → `getMonth(yearMonth)`

Não usar `nextMonthHelper()` (que retorna próximo mês **incompleto** para planejamento interno).

### D3 — Controle de acesso por link (toggle)

Adicionar em `CongregationSettings`:

| Campo | Default |
|-------|---------|
| `publicLinkCurrentWeekEnabled` | `true` |
| `publicLinkNextWeekEnabled` | `true` |
| `publicLinkCurrentMonthEnabled` | `true` |
| `publicLinkNextMonthEnabled` | `true` |

Comportamento quando `false`:

- API pública retorna **404** com corpo `{ message: "Este link está desativado." }`
- Página web mostra estado “Link desativado” (sem dados de designação)

Operador altera via `PATCH /settings` junto com nome/dia da reunião, ou endpoint dedicado `PATCH /settings/public-links` (preferir extensão do PATCH existente para simplicidade).

### D4 — API pública

Novo controller `PublicScheduleController` em `apps/api/src/public-schedule/`:

| Método | Rota | Escopo |
|--------|------|--------|
| GET | `/public/schedule/esta-semana` | semana ISO atual |
| GET | `/public/schedule/proxima-semana` | semana ISO seguinte |
| GET | `/public/schedule/este-mes` | mês civil atual |
| GET | `/public/schedule/proximo-mes` | mês civil +1 |

Todos com `@Public()`. Sem cookie necessário.

**DTO sanitizado** (`PublicScheduleView`):

```typescript
type PublicSlotView = {
  role: AssignmentRole;
  roleLabel: string;
  participantName: string | null; // null → UI mostra "—"
};

type PublicPartView = {
  partTypeLabel: string;
  title: string;
  topic: PartTopic;
  topicLabel: string;
  slots: PublicSlotView[];
};

type PublicWeekView = {
  meetingDate: string;       // YYYY-MM-DD
  weekStartDate: string;
  parts: PublicPartView[];
};

type PublicScheduleView = {
  congregationName: string;
  scope: 'current-week' | 'next-week' | 'current-month' | 'next-month';
  title: string;             // "Esta semana", etc.
  yearMonth?: string;        // presente em views mensais
  weeks: PublicWeekView[];
};
```

**Nunca incluir**: `participantPhone`, `participantId`, `slot.id` (opcional manter para acessibilidade interna — preferir omitir).

Mapear a partir de `getMonth` / query de semana isolada via método privado `toPublicWeekView(week)`.

### D5 — Rotas web públicas

Route group `apps/web/src/app/(public)/` **fora** de `(app)`:

```
(public)/
  layout.tsx          — layout mínimo, sem BottomNav
  esta-semana/page.tsx
  proxima-semana/page.tsx
  este-mes/page.tsx
  proximo-mes/page.tsx
```

Middleware — adicionar a `PUBLIC_PATHS`:

```typescript
const PUBLIC_PATHS = [
  "/login",
  "/esta-semana",
  "/proxima-semana",
  "/este-mes",
  "/proximo-mes",
];
```

Cada página:

1. Fetch server-side ou client `GET /api/public/schedule/<slug>` (rewrite existente)
2. Estado lista (default) vs impressão (toggle)
3. `meta robots noindex` opcional no layout público

### D6 — View lista (mobile-first)

Componente `PublicScheduleListView`:

- Cabeçalho: nome da congregação + título do escopo + data(s)
- Agrupar partes por `PartTopic` (mesma ordem da week view interna)
- Cada linha: papel + nome ou `—`
- Sem botões de edição, picker, WhatsApp

### D7 — Modo impressão (S-140-like)

Componente `PublicSchedulePrintView`:

- Ativado por botão “Modo impressão” / “Voltar à lista”
- Layout HTML/CSS tabular inspirado em `s140-document.tsx`:
  - Cabeçalho com data `dd/MM/yyyy | LEITURA SEMANAL DA BÍBLIA`
  - Seções coloridas (Tesouros, Ministério, Vida cristã)
  - Numeração e durações via mapa estático (extrair `DURATION_BY_CODE` para `@jw/shared` ou `apps/web/src/lib/s140-display.ts`)
  - Slots vazios: `—` em vez de `____________` (decisão do usuário para público)
- Para views mensais: uma “página” por semana, separador visual entre semanas
- CSS `@media print` para impressão limpa; botão “Imprimir” chama `window.print()`

**Não** gerar PDF no servidor para view pública — só HTML.

### D8 — Configurações: copiar links

Nova seção em `/settings` — **Links públicos**:

| Link | Path | Toggle |
|------|------|--------|
| Esta semana | `/esta-semana` | `publicLinkCurrentWeekEnabled` |
| Próxima semana | `/proxima-semana` | `publicLinkNextWeekEnabled` |
| Este mês | `/este-mes` | `publicLinkCurrentMonthEnabled` |
| Próximo mês | `/proximo-mes` | `publicLinkNextMonthEnabled` |

Cada linha:

- URL completa (`window.location.origin + path`) em campo read-only
- Botão **Copiar** (`navigator.clipboard.writeText`)
- Switch **Ativo** (salva via PATCH settings)

Links desativados: URL ainda visível para o operador (para reativar), com indicação visual “desativado”.

### D9 — Cache

Endpoints públicos: `Cache-Control: public, max-age=60` (dados mudam pouco, reduz carga). Web pages: `cache: 'no-store'` no fetch client para operador; visitantes podem cachear 60s via API.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Nomes expostos publicamente | Toggle por link; operador ciente ao copiar |
| Semana sem registro no banco | Empty state amigável |
| Duplicação lógica S-140 web vs PDF | Extrair formatadores para módulo compartilhado web (`s140-display.ts`); follow-up mover para `@jw/shared` |
| Conflito rota `/este-mes` com futuras rotas | Paths fixos documentados; reservados no middleware |

## Migration Plan

1. Migration Prisma: 4 booleans default `true` em `CongregationSettings`
2. Deploy API + web juntos (novos campos opcionais no PATCH com defaults)
3. Sem rollback de dados — flags podem ser setadas `false` para “desligar”

## Open Questions

- (Resolvido) Semana atual após reunião → permanece na semana ISO corrente
- (Resolvido) Slots vazios → `—`
- (Resolvido) Privacidade → aberto com toggle por link
- (Resolvido) Visual → lista + modo impressão S-140-like
