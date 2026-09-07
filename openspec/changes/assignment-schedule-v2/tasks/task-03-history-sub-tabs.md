# Task 3 — History sub-tabs

**Change:** `assignment-schedule-v2`  
**Grupo:** 3 de 6  
**Pré-requisitos:** [task-01](./task-01-month-horizon-and-list-api.md)  
**Desbloqueia:** (histórico mensal completo)

## Objetivo do grupo

Adicionar sub-abas na página Histórico: manter busca por designação e adicionar visão "Por mês" com arquivo mensal.

## Contexto para o subagent

- Página atual: `apps/web/src/app/(app)/history/page.tsx` — formulário de filtros + lista paginada
- Bottom nav: item "Histórico" → `/history`
- API: `listScheduleMonths()` de task-01
- Padrão de tabs: usar `useSearchParams` para `?view=assignments|months` (default `assignments`)

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/app/(app)/history/page.tsx` | editar |
| `apps/web/src/components/history-tabs.tsx` | criar |
| `apps/web/src/components/month-archive-list.tsx` | criar |
| `apps/web/src/components/month-status-badge.tsx` | reutilizar de task-02 se existir |

---

## 3.1 — HistoryTabs component

### O que fazer

`history-tabs.tsx`:
- Props: `activeView: 'assignments' | 'months'`, `onChange`
- Duas tabs com `role="tablist"` / `role="tab"` / `aria-selected`
- Labels: **Por designação** | **Por mês**
- Sync com URL: `router.replace('/history?view=...')` sem scroll

### Critérios de aceite

- [ ] Tabs acessíveis
- [ ] URL reflete view ativa
- [ ] Deep link `/history?view=months` funciona

---

## 3.2 — Refactor assignments view

### O que fazer

Extrair conteúdo atual de `history/page.tsx` para componente `AssignmentHistoryView` (inline no mesmo arquivo ou `assignment-history-view.tsx`).

Renderizar quando `view === 'assignments'`.

### Critérios de aceite

- [ ] Comportamento idêntico ao atual (filtros, paginação)
- [ ] Nenhuma regressão na busca

---

## 3.3 — Month archive sub-tab

### O que fazer

`month-archive-list.tsx`:
- Carrega `listScheduleMonths()`
- Filtra e exibe meses com `isPast || isCurrent` (não listar meses futuros de planejamento aqui — foco em arquivo; opcionalmente incluir atual)
- Cada linha: mês, badge status, link `/schedule/[yearMonth]`
- Empty state: "Nenhum mês registrado ainda"
- Agrupar por ano se útil (ex.: "2026", "2025")

Sub-aba **Por mês** = consulta + atalho para editar/exportar PDF do mês.

### Critérios de aceite

- [ ] Lista meses passados existentes no sistema
- [ ] Clique abre visão do mês (editável + PDF)
- [ ] Status badges consistentes com hub Designações

---

## 3.4 — Smoke test

### O que fazer

1. `/history` → tab designação → filtrar por nome
2. `/history?view=months` → ver meses → abrir um mês
3. Voltar e trocar tabs

### Critérios de aceite

- [ ] Sem perda de estado ao trocar tabs (filtros resetam ok ao sair de designação)

---

## Verificação do grupo

Browser em `/history` com ambas sub-abas.

## Handoff para próxima task

`MonthStatusBadge` e `listScheduleMonths` compartilhados entre Designações e Histórico.
