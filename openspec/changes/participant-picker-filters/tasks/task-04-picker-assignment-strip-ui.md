# Task 4 — Picker assignment strip UI

**Change:** `participant-picker-filters`  
**Grupo:** 4 de 5  
**Pré-requisitos:** [task-01](./task-01-last-assignment-on-eligible-api.md)  
**Desbloqueia:** [task-05](./task-05-picker-filters-smoke.md)

## Objetivo do grupo

Painel de designações recentes por participante dentro do picker, altura fixa ~3 linhas, scroll interno.

## Contexto para o subagent

- `listParticipantAssignments` — `apps/web/src/lib/participants.ts`
- Formatação: `formatDateBr`, `ROLE_LABELS` (schedule), `TOPIC_LABELS` opcional truncado
- `EligibleOption` em `participant-picker.tsx`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/participant-assignment-strip.tsx` | criar (recomendado) |
| `apps/web/src/components/participant-picker.tsx` | editar |

---

## 4.1 — Componente strip

### O que fazer

`ParticipantAssignmentStrip({ participantId, open, onToggle })`:

- Container: `max-h-[4.5rem]` (ou equivalente ~3 linhas), `overflow-y-auto`, `overscroll-behavior: contain`, borda sutil
- Linha: `{formatDateBr(meetingDate)} · {ROLE_LABELS[role]} · {partTypeLabel}` — `truncate` ou `text-ellipsis`
- Loading / erro compactos

### Critérios de aceite

- [ ] Com 10+ designações, só a caixa rola; lista principal do picker não cresce além do strip aberto

---

## 4.2 — Lazy load e cache

### O que fazer

- Fetch ao primeiro `open` por `participantId`
- Cache `Map<participantId, AssignmentHistoryItem[]>` no picker enquanto montado
- `stopPropagation` em toggle e na caixa scroll

### Critérios de aceite

- [ ] Segundo expand não refetch desnecessário

---

## 4.3 — Integração EligibleOption

### O que fazer

- Toggle “Designações” à direita ou abaixo da tabela de contadores
- `onClick` na área nome+contadores → `onSelect` (assign)
- Teclado: strip não deve roubar Enter da opção sem foco explícito

### Critérios de aceite

- [ ] Assign imediato preservado na área principal
- [ ] `aria-expanded` no trigger

### Não fazer

- Não navegar para página de participante

---

## Verificação do grupo

Teste manual em viewport 390px

## Handoff

Smoke task-05
