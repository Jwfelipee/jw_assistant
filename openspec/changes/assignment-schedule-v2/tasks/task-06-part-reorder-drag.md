# Task 6 — Part reorder drag

**Change:** `assignment-schedule-v2`  
**Grupo:** 6 de 6  
**Pré-requisitos:** [task-01](./task-01-month-horizon-and-list-api.md) (API), [task-05](./task-05-add-part-modal.md) recomendado (partes extras para testar)  
**Desbloqueia:** (change completa)

## Objetivo do grupo

Permitir reordenar partes FSM e NVC (exceto estudo bíblico) por arrastar na tela da semana, com persistência via API.

## Contexto para o subagent

- `WeekPart.sortOrder` em Prisma — já usado em queries `orderBy: { sortOrder: 'asc' }`
- `nextSortOrderForTopic` em `schedule.service.ts` — faixas: FSM ~20+, NVC ~30+, estudo 90
- `isStudyPartType(code)` em `assign-rules.ts`
- Week page lista partes por `partsByTopic` — cada `part` em `<li>`
- Sem lib dnd no projeto — adicionar `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/api/src/schedule/schedule.controller.ts` | editar |
| `apps/api/src/schedule/dto/reorder-week-parts.dto.ts` | criar |
| `apps/api/src/schedule/schedule.service.spec.ts` | editar |
| `apps/web/package.json` | editar (deps dnd-kit) |
| `apps/web/src/lib/schedule.ts` | editar |
| `apps/web/src/components/sortable-week-parts.tsx` | criar |
| `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx` | editar |

---

## 6.1 — Reorder API

### O que fazer

**DTO** `ReorderWeekPartsDto`:
```typescript
{ orderedPartIds: string[] }  // min 1, all strings
```

**`PATCH /schedule/weeks/:weekId/parts/reorder`**:

1. Carregar week com parts + partType
2. Validar cada id pertence à week
3. Validar cada part é `MINISTRY` ou `CHRISTIAN_LIFE` e **não** `ESTUDO_BIBLICO`
4. Validar `orderedPartIds` contém exatamente todas as partes reordenáveis da week (FSM+NVC non-study) — ordem completa
5. Recalcular `sortOrder`:
   - Manter sortOrder de OUT_OF_TOPIC e TREASURES inalterados
   - Atribuir FSM na ordem recebida: 20, 21, 22, …
   - Atribuir NVC non-study: 30, 31, … (sempre < estudo)
   - Estudo permanece em 90
6. Transaction: update many

Retornar `{ ok: true }` ou week view atualizada.

### Critérios de aceite

- [x] Reorder FSM persiste e reflete em GET month
- [x] Estudo não pode ser incluído no payload
- [x] Tesouros/fora de tópico inalterados
- [x] IDs inválidos → 400

### Não fazer

- Não permitir mover parte entre seções (FSM ↔ NVC)

---

## 6.2 — Install dnd-kit

### O que fazer

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities --filter web
```

### Critérios de aceite

- [x] Deps instaladas no workspace

---

## 6.3 — SortableWeekParts component

### O que fazer

`sortable-week-parts.tsx`:
- Props: `parts: WeekPartView[]`, `onReorder: (orderedIds: string[]) => Promise<void>`
- `DndContext` + `SortableContext` + `useSortable` por item
- Drag handle (ícone ≡ ou ⠿) à esquerda — min 44px touch target
- `PointerSensor` + `TouchSensor` com `activationConstraint: { distance: 8 }` (evita scroll acidental)
- `onDragEnd`: calcular nova ordem, chamar `onReorder`
- Optimistic UI opcional; rollback em erro

Helper web:
```typescript
export async function reorderWeekParts(weekId: string, orderedPartIds: string[]) {
  await fetch(`/api/schedule/weeks/${weekId}/parts/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ orderedPartIds }),
    ...
  });
}
```

### Critérios de aceite

- [x] Drag funciona desktop e touch
- [x] Só partes `deletable` (FSM/NVC extras + defaults deletable) mostram handle — **ou** todas FSM/NVC exceto estudo
- [x] Estudo e partes fixas de tesouros sem handle

**Decisão:** partes FSM/NVC **deletable** e defaults deletable são arrastáveis; partes system non-deletable em tesouros/fora de tópico não aparecem nas listas sortable (já separadas por topic). Na seção FSM/NVC: todas as partes listadas exceto `ESTUDO_BIBLICO` são draggables.

---

## 6.4 — Integrate + tests

### O que fazer

Week page:
- Substituir `<ul>` de partes FSM e NVC por `<SortableWeekParts>`
- Tesouros e fora de tópico: lista estática (sem drag)

API tests:
- Reorder 3 FSM parts → sortOrder 20,21,22
- Reject study id in payload
- Reject foreign week id

Smoke:
- Arrastar FSM, reload, ordem mantida
- Export PDF reflete nova ordem

### Critérios de aceite

- [x] API tests passam
- [x] Drag smoke ok
- [x] PDF mostra ordem atualizada

---

## Verificação do grupo

```bash
# API test
pnpm --filter api test schedule.service.spec

# Manual: drag na semana, curl month view
```

## Handoff

Change `assignment-schedule-v2` completa. Pronta para `/opsx-apply`.
