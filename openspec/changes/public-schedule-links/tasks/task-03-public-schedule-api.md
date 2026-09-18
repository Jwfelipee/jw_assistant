# Task 3 — Public schedule API

**Change:** `public-schedule-links`
**Grupo:** 3 de 5
**Pré-requisitos:** [1. Schema](./task-01-schema-and-public-link-settings.md), [2. ISO week helpers](./task-02-iso-week-helpers.md)
**Desbloqueia:** [4. Public web pages](./task-04-public-web-pages.md), [5. Settings UI](./task-05-settings-public-links-ui.md)

## Objetivo do grupo

Expor quatro endpoints públicos read-only que retornam designações sanitizadas, respeitando toggles de settings.

## Contexto para o subagent

- Schedule existente: `apps/api/src/schedule/schedule.service.ts` — `getMonth(yearMonth)` retorna `MonthView`
- Auth público: `@Public()` de `apps/api/src/common/decorators/public.decorator.ts`
- Settings: `SettingsService.get()` após task 1 inclui os quatro booleans
- Labels: reutilizar `ROLE_LABELS` / `TOPIC_LABELS` de assign-rules ou duplicar mapa mínimo no mapper
- Slot vazio → `participantName: null` (web renderiza `—`)
- **Nunca** incluir `participantPhone`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/public-schedule/public-schedule.module.ts` | criar |
| `apps/api/src/public-schedule/public-schedule.service.ts` | criar |
| `apps/api/src/public-schedule/public-schedule.controller.ts` | criar |
| `apps/api/src/public-schedule/public-schedule.types.ts` | criar |
| `apps/api/src/public-schedule/public-schedule.service.spec.ts` | criar |
| `apps/api/src/app.module.ts` | editar |

---

## 3.1 — PublicScheduleService

### O que fazer

Criar service com métodos:

```typescript
getCurrentWeek(now?: Date): Promise<PublicScheduleView>
getNextWeek(now?: Date): Promise<PublicScheduleView>
getCurrentMonth(now?: Date): Promise<PublicScheduleView>
getNextMonth(now?: Date): Promise<PublicScheduleView>
```

**Gate por link** — antes de retornar dados:

```typescript
const settings = await this.settingsService.get();
if (!settings.publicLinkCurrentWeekEnabled) {
  throw new NotFoundException('Este link está desativado.');
}
```

**Resolução semana** (`getCurrentWeek` / `getNextWeek`):

1. `bounds = isoWeekBoundsForDate(now)` (ou `addIsoWeeks(bounds, 1)`)
2. Query Prisma:

```typescript
const weeks = await prisma.week.findMany({
  where: {
    meetingDate: {
      gte: toUtcDateOnly(bounds.start),
      lte: toUtcDateOnly(bounds.end),
    },
  },
  include: { parts: { include: { slots: { include: { participant: true } }, partType: true } } },
  orderBy: { meetingDate: 'asc' },
});
```

3. Mapear para `PublicWeekView[]` (tipicamente 0 ou 1 semana)

**Resolução mês**:

```typescript
const ym = currentYearMonth(now); // ou addMonths(ym, 1)
const month = await this.scheduleService.getMonth(formatYearMonth(ym.year, ym.month));
return toPublicMonthView(month);
```

**Mapper `toPublicWeekView`**:

- Omitir `participantPhone`, `participantId`, `slot.id`
- `participantName` = `slot.participant?.name ?? null`
- Incluir `roleLabel` (Titular, Ajudante, etc.)
- Ordenar parts por `sortOrder`, agrupar por topic na UI (API pode retornar flat com `topic`)

**Títulos**:

| Scope | `title` |
|-------|---------|
| current-week | `Esta semana` |
| next-week | `Próxima semana` |
| current-month | `Este mês` |
| next-month | `Próximo mês` |

Incluir `congregationName` de settings.

### Critérios de aceite

- [ ] Semana com meeting na ISO week correta é retornada
- [ ] Mês retorna todas as semanas do `MonthView`
- [ ] Nenhum campo de telefone no JSON

### Não fazer

- Não chamar `ensureHorizon` automaticamente (páginas públicas mostram o que existe; operador provisiona via app autenticado)

---

## 3.2 — PublicScheduleController

### O que fazer

```typescript
@Controller('public/schedule')
export class PublicScheduleController {
  @Public()
  @Get('esta-semana')
  currentWeek() { return this.service.getCurrentWeek(); }

  @Public()
  @Get('proxima-semana')
  nextWeek() { ... }

  @Public()
  @Get('este-mes')
  currentMonth() { ... }

  @Public()
  @Get('proximo-mes')
  nextMonth() { ... }
}
```

Registrar `PublicScheduleModule` em `app.module.ts`.

### Critérios de aceite

- [ ] Rotas respondem sem cookie
- [ ] Paths batem com rewrite `/api/public/schedule/*` no Next

### Não fazer

- Não exigir API key

---

## 3.3 — Cache e 404

### O que fazer

No controller ou interceptor, setar header:

```
Cache-Control: public, max-age=60
```

Link desabilitado → `NotFoundException` com mensagem em português.

### Critérios de aceite

- [ ] Response 404 quando toggle false
- [ ] Header Cache-Control presente em 200

### Não fazer

- Não cachear 404 por muito tempo

---

## 3.4 — Tests

### O que fazer

`public-schedule.service.spec.ts` com mocks de Prisma/ScheduleService/SettingsService:

- current week com meeting na ISO week
- next week
- current/next month delega a getMonth
- link disabled → throws NotFoundException
- mapper omite phone

### Critérios de aceite

- [ ] `pnpm --filter api test -- public-schedule` passa

### Não fazer

- Não e2e browser nesta task

---

## Verificação do grupo

```bash
# Sem auth:
curl http://localhost:3001/public/schedule/esta-semana
curl http://localhost:3001/public/schedule/este-mes

# Após desabilitar toggle:
curl -i http://localhost:3001/public/schedule/esta-semana  # 404
```

## Handoff para próxima task

API pronta; web pages farão fetch para `/api/public/schedule/<slug>`.
