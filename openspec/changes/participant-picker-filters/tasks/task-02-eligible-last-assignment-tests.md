# Task 2 — Eligible last assignment tests

**Change:** `participant-picker-filters`  
**Grupo:** 2 de 5  
**Pré-requisitos:** [task-01](./task-01-last-assignment-on-eligible-api.md)  
**Desbloqueia:** [task-05](./task-05-picker-filters-smoke.md)

## Objetivo do grupo

Testes automatizados para `lastAssignment` em `getEligibleParticipants`.

## Contexto para o subagent

- `apps/api/src/schedule/schedule.service.spec.ts` — padrão de mock Prisma existente

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.spec.ts` | editar |

---

## 2.1 — Histórico com duas datas

### O que fazer

Fixture: participante elegível com dois slots (datas diferentes). Mock retorna ambos na query de last assignment.

### Critérios de aceite

- [ ] `lastAssignment.meetingDate` é a mais recente
- [ ] `role` e `partTypeLabel` correspondem ao slot vencedor

---

## 2.2 — Sem histórico

### O que fazer

Participante elegível sem slots passados.

### Critérios de aceite

- [ ] `lastAssignment` é `null`

---

## Verificação do grupo

`cd apps/api && pnpm test`

## Handoff

Confiança para UI de filtros.
