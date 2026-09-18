# Task 2 — ISO week resolution helpers

**Change:** `public-schedule-links`
**Grupo:** 2 de 5
**Pré-requisitos:** [1. Schema and settings](./task-01-schema-and-public-link-settings.md) (independente — pode rodar em paralelo após merge, mas ordem recomendada 1→2)
**Desbloqueia:** [3. Public schedule API](./task-03-public-schedule-api.md)

## Objetivo do grupo

Criar helpers de calendário ISO em `@jw/shared` para resolver “semana atual” e “próxima semana” de forma testável e independente do Prisma.

## Contexto para o subagent

- Calendário existente: `packages/shared/src/calendar/weeks.ts` (`currentYearMonth`, `addMonths`, `formatDateOnly`)
- `meetingDate` é armazenado como `@db.Date` UTC midnight
- Decisão do usuário: semana atual = ISO week (seg–dom) contendo hoje, **mesmo após o dia da reunião**
- Testes: colocar em `packages/shared/src/calendar/iso-week.spec.ts` ou `.test.ts` conforme padrão do pacote
- **Não alterar** `buildWeeksForMonth` ou regras de assign

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `packages/shared/src/calendar/iso-week.ts` | criar |
| `packages/shared/src/calendar/iso-week.spec.ts` | criar |
| `packages/shared/src/index.ts` | editar |

---

## 2.1 — Implementar iso-week.ts

### O que fazer

```typescript
export type IsoWeekBounds = {
  /** Monday 00:00:00 local */
  start: Date;
  /** Sunday 23:59:59.999 local — ou Monday+6 dias 00:00 para comparação date-only */
  end: Date;
};

/** ISO week (Mon–Sun) containing `date` in local calendar. */
export function isoWeekBoundsForDate(date: Date): IsoWeekBounds;

/** Add `weeks` ISO weeks to bounds (typically weeks=1 for next week). */
export function addIsoWeeks(bounds: IsoWeekBounds, weeks: number): IsoWeekBounds;

/** True if `target` (date-only) is within [start, end] inclusive. */
export function dateInIsoWeek(target: Date, bounds: IsoWeekBounds): boolean;
```

Implementação sugerida para `isoWeekBoundsForDate`:

1. Copiar `date` para meia-noite local
2. `dayOfWeek = date.getDay()` (0=Sun, 1=Mon, …)
3. `daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1`
4. `start = date - daysFromMonday`
5. `end = start + 6 dias`

Usar componentes locais (não UTC) para bounds, mas comparar `meetingDate` via `formatDateOnly` / `parseDateOnly` para consistência com DB.

### Critérios de aceite

- [ ] Segunda 2026-09-14 com `date = 2026-09-18 (sexta)` → bounds 14–20 set
- [ ] `addIsoWeeks(..., 1)` → 21–27 set

### Não fazer

- Não consultar Prisma neste arquivo

---

## 2.2 — Exportar do pacote

### O que fazer

Adicionar em `packages/shared/src/index.ts`:

```typescript
export {
  isoWeekBoundsForDate,
  addIsoWeeks,
  dateInIsoWeek,
  type IsoWeekBounds,
} from "./calendar/iso-week";
```

### Critérios de aceite

- [ ] `import { isoWeekBoundsForDate } from "@jw/shared"` funciona em api e web

### Não fazer

- Não reexportar de paths internos não públicos

---

## 2.3 — Unit tests

### O que fazer

Casos obrigatórios:

| Cenário | Entrada | Esperado |
|---------|---------|----------|
| Meio da semana | 2026-09-18 (sex) | start 2026-09-14, end 2026-09-20 |
| Domingo | 2026-09-20 (dom) | mesma semana que sexta 18 |
| Virada de ano | 2026-01-01 (qui) | semana que inclui 01/01 |
| Próxima semana | bounds + 1 | início +7 dias |
| Pós-reunião | meetingDate qui 17/09, hoje sex 18/09 | `dateInIsoWeek(meetingDate, bounds)` = true |

### Critérios de aceite

- [ ] Todos os testes passam (`pnpm --filter @jw/shared test`)

### Não fazer

- Não mockar banco

---

## Verificação do grupo

```bash
pnpm --filter @jw/shared test -- iso-week
```

## Handoff para próxima task

`PublicScheduleService` importará `isoWeekBoundsForDate` e `addIsoWeeks` para queries de semana por `meetingDate`.
