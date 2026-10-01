# Task 1 — Month horizon and list API

**Change:** `assignment-schedule-v2`  
**Grupo:** 1 de 6  
**Pré-requisitos:** (nenhum)  
**Desbloqueia:** [2. Schedule month hub](./task-02-schedule-month-hub-ui.md), [3. History sub-tabs](./task-03-history-sub-tabs.md)

## Objetivo do grupo

Expor API para provisionar automaticamente o horizonte de 7 meses (mês civil atual + 6 à frente) e listar meses com status de completude.

## Contexto para o subagent

- `monthCompleteness(ym)` já existe como método **privado** em `apps/api/src/schedule/schedule.service.ts` (~linha 936)
- `ensureMonth(yearMonth)` cria mês + semanas + partes padrão — idempotente
- `nextMonthHelper()` usa `monthCompleteness` em loop — reutilizar a mesma lógica
- Calendário: `@jw/shared` → `currentYearMonth`, `addMonths`, `formatYearMonth`, `parseYearMonth`
- Controller: `apps/api/src/schedule/schedule.controller.ts`
- **Não alterar** regras de assign/suggest/eligibility

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/api/src/schedule/schedule.controller.ts` | editar |
| `apps/api/src/schedule/dto/months-query.dto.ts` | criar |
| `apps/api/src/schedule/schedule.service.spec.ts` | editar |
| `apps/web/src/lib/schedule.ts` | editar |

---

## 1.1 — Extract completeness + ensureHorizon

### O que fazer

1. Renomear/expor lógica de `monthCompleteness` como método público ou interno reutilizável `getMonthStatus(ym: YearMonth)`.
2. Adicionar `async ensureHorizon(now = new Date())`:
   ```typescript
   const start = currentYearMonth(now);
   for (let i = 0; i <= 6; i++) {
     const ym = addMonths(start, i);
     await this.ensureMonth(formatYearMonth(ym.year, ym.month));
   }
   return { ensuredFrom: formatYearMonth(start.year, start.month), ensuredTo: ... };
   ```
3. **Não** criar meses passados automaticamente — só o horizonte futuro a partir do mês civil atual.

### Critérios de aceite

- [ ] `ensureHorizon` cria exatamente os meses faltantes entre atual e +6
- [ ] Segunda chamada não duplica semanas/partes
- [ ] Meses passados inalterados se já existiam

### Não fazer

- Não criar cron job nesta task
- Não alterar `ensureMonth` semantics

---

## 1.2 — Endpoints

### O que fazer

**`POST /schedule/horizon/ensure`** (auth required)
- Chama `ensureHorizon()`
- Retorna `{ ensuredFrom, ensuredTo, monthsEnsured: number }`

**`GET /schedule/months`** (auth required)
- Query DTO: `from?: string`, `to?: string` (YYYY-MM)
- Antes de listar: chamar `ensureHorizon()` (garante horizonte)
- Buscar todos os `Month` no banco entre `from` e `to` (defaults: `from` = sem limite, `to` = atual+6)
- Para cada mês: `getMonthStatus` + metadados:

```typescript
type MonthSummary = {
  yearMonth: string;
  exists: true;
  complete: boolean;
  openSlots: number;
  weekCount: number;
  isPast: boolean;      // yearMonth < current civil month
  isCurrent: boolean;
  isInHorizon: boolean; // current <= ym <= current+6
  href: string;         // `/schedule/${yearMonth}`
};
```

Ordenar: meses passados desc, depois horizonte asc (ou única lista desc por yearMonth).

Registrar rotas em `schedule.controller.ts` com guards de auth existentes.

### Critérios de aceite

- [ ] `GET /schedule/months` retorna horizonte com status correto
- [ ] Meses passados no banco aparecem com `isPast: true`
- [ ] Sem auth → 401

### Não fazer

- Não incluir semanas/partes no payload (só summary)

---

## 1.3 — Web helpers

### O que fazer

Em `apps/web/src/lib/schedule.ts`:

```typescript
export type MonthSummary = { ... };

export async function ensureHorizon(): Promise<void> {
  await fetch('/api/schedule/horizon/ensure', { method: 'POST', credentials: 'include' });
}

export async function listScheduleMonths(params?: { from?: string; to?: string }): Promise<{
  currentYearMonth: string;
  horizonEnd: string;
  months: MonthSummary[];
}> { ... }
```

### Critérios de aceite

- [ ] Tipos exportados e usáveis pela UI
- [ ] Erros propagados com mensagem pt-BR

---

## 1.4 — Tests

### O que fazer

Em `schedule.service.spec.ts`:
- Mock prisma para `ensureHorizon` idempotente
- `getMonthStatus` / list: mês vazio → `complete: false`, mês com todos slots filled → `complete: true`

### Critérios de aceite

- [ ] Testes passam com `pnpm --filter api test` (ou comando do monorepo)

---

## Verificação do grupo

```bash
# Após login
curl -b cookies.txt -X POST http://localhost:3001/schedule/horizon/ensure
curl -b cookies.txt http://localhost:3001/schedule/months | jq
```

## Handoff para próxima task

UI pode consumir `listScheduleMonths()` e `ensureHorizon()`. `MonthSummary` pronto para badges de status.
