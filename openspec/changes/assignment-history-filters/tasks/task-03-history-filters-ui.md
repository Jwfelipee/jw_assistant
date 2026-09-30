# Task 3 — History filters UI

**Change:** `assignment-history-filters`  
**Grupo:** 3 de 4  
**Pré-requisitos:** [task-01](./task-01-history-api-filters.md)  
**Desbloqueia:** [task-04](./task-04-history-filters-smoke.md)

## Objetivo do grupo

Atualizar a aba **Por designação** do Histórico com filtros de sexo, designação (catálogo), papéis do Estudo e toggle “última por participante”.

## Contexto para o subagent

- Componente: `apps/web/src/components/assignment-history-view.tsx`
- Catálogo: `listPartTypes()` em `apps/web/src/lib/catalog.ts`
- Labels: `TOPIC_LABELS` em `apps/web/src/lib/schedule.ts`
- Constante estudo: `code === 'ESTUDO_BIBLICO'`
- Página pai: `apps/web/src/app/(app)/history/page.tsx` (não precisa mudar se só o view mudar)

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/assignment-history-view.tsx` | editar |

---

## 3.1 — Dropdown de designação

### O que fazer

- `useEffect` ao montar: `listPartTypes()` → ordenar por `defaultSortOrder`
- Select **Designação**:
  - `<option value="">Todas as designações</option>`
  - `<optgroup label={TOPIC_LABELS[topic]}>` por tópico
  - `<option value={pt.id}>{pt.label}</option>`
- Estado `partTypeId: string` no `Filters`

### Critérios de aceite

- [ ] Todos os tipos do catálogo aparecem (incl. NVC/FSM custom)
- [ ] Optgroups legíveis em pt-BR

---

## 3.2 — Sexo e última por participante

### O que fazer

- Select sexo: `""` | `MALE` | `FEMALE` — labels **Todos** | **Homens** | **Mulheres**
- Checkbox: **Apenas a última designação de cada participante** → `lastPerParticipant`
- Texto de ajuda curto sob o checkbox (opcional): menciona que com período usa a última **dentro** do intervalo

Passar campos em `fetchAssignmentHistory` ao filtrar.

### Critérios de aceite

- [ ] Limpar filtros reseta novos campos
- [ ] Paginação usa filtros aplicados

---

## 3.3 — Papéis do Estudo bíblico

### O que fazer

Quando `partTypeId` selecionado resolve para `code === 'ESTUDO_BIBLICO'`:

- Mostrar select **Papel no estudo** (em vez do select genérico de papel, ou substituir temporariamente):
  - `""` → Todos os papéis (não enviar `studyRole`)
  - `DIRIGENTE` → `studyRole=DIRIGENTE`
  - `LEITOR` → `studyRole=LEITOR`
  - `BOTH` → `studyRole=BOTH` (label **Dirigente e leitor**)

Para outras designações:

- Manter select **Papel** atual (`TITULAR`, `AJUDANTE`, …) quando `slotMode === TWO` ou sempre mostrar roles do enum que existem nos slots daquela parte (mínimo: comportamento atual com `role`)

Quando **Todas as designações**: manter select de papel genérico como hoje (opcional ocultar study-specific).

### Critérios de aceite

- [ ] Três modos de estudo + todos funcionam
- [ ] Trocar de Estudo para Joias limpa `studyRole` e usa `role` normal

---

## 3.4 — Remover filtro de tópico

### O que fazer

- Remover select **Tópico** do formulário
- Não enviar `topic` na query (designação cobre o caso)
- Atualizar subtítulo em `history/page.tsx` se mencionar só tópico: ex. “Busque por nome, período, designação ou papel.”

### Critérios de aceite

- [ ] Sem regressão na lista (loading, empty state, paginação)
- [ ] `ROLE_LABELS` / linhas de resultado inalterados

### Não fazer

- Não alterar `MonthArchiveList` nem `HistoryTabs`

---

## Verificação do grupo

Dev server: `/history` → aplicar filtros e inspecionar rede (`/api/assignments/history?...`).

## Handoff para próxima task

UI pronta para smoke manual documentado na task-04.
