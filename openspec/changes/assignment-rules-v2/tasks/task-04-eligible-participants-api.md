# Task 4 — Eligible participants API enriched

**Change:** `assignment-rules-v2`  
**Grupo:** 4 de 8  
**Pré-requisitos:** [task-02](./task-02-count-taxonomy-and-recalc.md), [task-03](./task-03-eligibility-qualified-rules.md)  
**Desbloqueia:** [task-07](./task-07-participant-picker-counts.md)

## Objetivo do grupo

Enriquecer `GET /slots/:id/eligible-participants` com breakdown de contadores, ordenação inteligente, e atualizar suggest.

## Contexto para o subagent

- Endpoint: `schedule.controller.ts` → `getEligibleParticipants`
- Builder: `buildParticipantEligibilityForSlot` em `schedule.service.ts` (~851)
- Sort atual: alfabético linha 694 — **substituir**
- `sortSuggestionCandidates` em `assign-rules.ts` — atualizar para `AssignmentCountCategory`
- Web types: `apps/web/src/lib/schedule.ts` — `EligibleParticipant`

Month scope: `slot.weekPart.week.monthId` + `yearMonth` do mês civil da programação.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/api/src/schedule/assign-rules.ts` | editar |
| `apps/api/src/schedule/schedule.service.spec.ts` | editar |
| `apps/web/src/lib/schedule.ts` | editar |

---

## 4.1 — Agregação de contadores

### O que fazer

Método privado:

```typescript
private async buildParticipantCountMaps(
  participantIds: string[],
  monthId: string,
): Promise<Map<string, { month: Partial<Record<AssignmentCountCategory, number>>; total: Partial<...> }>>
```

Abordagem eficiente:

1. Query todos `AssignmentSlot` dos participantIds com `weekPart.partType`, `weekPart.week.monthId`, `role`, `participant.sex`
2. Para cada slot, `resolveCountCategory` → incrementar bucket `month` se `week.monthId === monthId`, sempre `total`
3. Omitir chaves com valor 0 no output

Alternativa SQL: raw query com GROUP BY se performance for problema (70+ participantes × histórico).

### Critérios de aceite

- [ ] Contagens mês batem com assignments do mês da semana aberta
- [ ] Total = lifetime

---

## 4.2 — Response enriched

### O que fazer

```typescript
type EligibleParticipantView = {
  id: string;
  name: string;
  sex: string;
  privilege: string;
  phone: string | null;
  assignedThisWeek: boolean;
  countsThisMonth: Partial<Record<AssignmentCountCategory, number>>;
  countsTotal: Partial<Record<AssignmentCountCategory, number>>;
};
```

Response root:

```typescript
{
  slotId: string;
  role: AssignmentRole;
  sortCategory: AssignmentCountCategory;
  eligible: EligibleParticipantView[];
  ineligibleVisible: ...;
}
```

`sortCategory` = `resolveCountCategory` para o slot em aberto.

`assignedThisWeek`:

```typescript
const weekSlots = await prisma.assignmentSlot.count({
  where: { participantId: p.id, weekPart: { weekId }, id: { not: slot.id } },
});
assignedThisWeek = weekSlots > 0;
```

Remover campo legado `counter` ou manter temporariamente como `countsTotal[sortCategory] ?? 0` para compat.

### Critérios de aceite

- [ ] JSON conforme spec
- [ ] Controller retorna novos campos

---

## 4.3 — Ordenação

### O que fazer

```typescript
function sortEligibleParticipants(
  eligible: EligibleParticipantView[],
  sortCategory: AssignmentCountCategory,
): EligibleParticipantView[] {
  return [...eligible].sort((a, b) => {
    if (a.assignedThisWeek !== b.assignedThisWeek) {
      return a.assignedThisWeek ? 1 : -1;
    }
    const am = a.countsThisMonth[sortCategory] ?? 0;
    const bm = b.countsThisMonth[sortCategory] ?? 0;
    if (am !== bm) return am - bm;
    const at = a.countsTotal[sortCategory] ?? 0;
    const bt = b.countsTotal[sortCategory] ?? 0;
    if (at !== bt) return at - bt;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}
```

Aplicar em `getEligibleParticipants` após build.

### Critérios de aceite

- [ ] Participante com designação na semana aparece após os demais
- [ ] Menor contagem relevante primeiro

---

## 4.4 — Suggest sorting

### O que fazer

Atualizar `sortSuggestionCandidates` para receber `sortCategory` em vez de `role`, ou derivar category do part context em `suggestForPart`.

### Critérios de aceite

- [ ] Sugerir retorna participante com menor contagem da categoria correta

---

## 4.5 — Web types

### O que fazer

Atualizar `EligibleParticipant` e `EligibleParticipantsResult` em `schedule.ts`.

### Critérios de aceite

- [ ] Types compilam no web

### Não fazer

- Não alterar UI do picker (task 7)

---

## Verificação do grupo

```bash
cd apps/api && npm test -- schedule.service
# curl GET /api/slots/:id/eligible-participants com cookie de sessão
```

## Handoff

API pronta para picker com tabelinhas e sort.
