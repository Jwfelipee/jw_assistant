# Task 1 — Last assignment on eligible API

**Change:** `participant-picker-filters`  
**Grupo:** 1 de 5  
**Pré-requisitos:** histórico / elegíveis já em produção  
**Desbloqueia:** [task-02](./task-02-eligible-last-assignment-tests.md), [task-03](./task-03-picker-filters-ui.md)

## Objetivo do grupo

Incluir `lastAssignment` global em cada participante retornado por `GET /slots/:id/eligible-participants`.

## Contexto para o subagent

- `apps/api/src/schedule/schedule.service.ts` — `getEligibleParticipants` (~712)
- Tipos `EligibleParticipantView` no mesmo arquivo
- Web: `apps/web/src/lib/schedule.ts` — `EligibleParticipant`
- Reuso: padrão SQL de `historyLastPerParticipant` / `DISTINCT ON (participantId)` em `history` se já existir helper

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/web/src/lib/schedule.ts` | editar |

---

## 1.1 — Tipos lastAssignment

### O que fazer

```typescript
export type LastAssignmentView = {
  meetingDate: string;
  role: AssignmentRole;
  partTypeLabel: string;
  partTopic: PartTopic;
};
```

Adicionar `lastAssignment: LastAssignmentView | null` em `EligibleParticipantView` e `EligibleParticipant`.

### Critérios de aceite

- [ ] Typecheck API e web passam

---

## 1.2 — Batch load

### O que fazer

Após montar lista `eligible` (ids únicos):

1. Query slots com `participantId IN (...)`, join week → meetingDate, weekPart → partType
2. Para cada participantId, manter slot de **maior** `meetingDate`
3. Mapear para `LastAssignmentView` e anexar em cada item de `eligible`

Participantes sem slots: `null`.

Preferir **uma** query (raw ou Prisma groupBy + max date) em vez de loop por id.

### Critérios de aceite

- [ ] Última global, não restrita ao part type do slot atual
- [ ] Não altera ordenação `sortEligibleParticipants` existente

### Não fazer

- Não mudar regras de `buildParticipantEligibilityForSlot`

---

## 1.3 — Response JSON

### O que fazer

Garantir serialização camelCase consistente com API atual.

### Critérios de aceite

- [ ] `curl` autenticado em `/api/slots/:id/eligible-participants` mostra `lastAssignment` nos elegíveis

---

## Verificação do grupo

`pnpm --filter api typecheck` · smoke manual do endpoint

## Handoff

Task-02 testes; task-03 consome `lastAssignment.role` no filtro.
