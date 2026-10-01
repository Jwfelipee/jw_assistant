# Task 5 — Picker filters smoke

**Change:** `participant-picker-filters`  
**Grupo:** 5 de 5  
**Pré-requisitos:** [task-03](./task-03-picker-filters-ui.md), [task-04](./task-04-picker-assignment-strip-ui.md)  
**Desbloqueia:** —

## Objetivo do grupo

Validar fluxo na week view com dados reais ou seed.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| (opcional) artifacts em `/opt/cursor/artifacts/` | screenshots |

---

## 5.1 — Filtros e estado por slot

### O que fazer

1. Abrir slot Presidente → filtrar última = Ajudante → fechar
2. Abrir outro slot → filtros default
3. Voltar Presidente → filtros restaurados
4. Limpar filtros → lista completa

### Critérios de aceite

- [ ] Comportamento conforme spec

---

## 5.2 — Strip e mobile

### O que fazer

1. Expandir designações de um participante com ≥4 entradas
2. Verificar 3 linhas visíveis e scroll interno
3. Assign clicando no nome sem expandir strip

### Critérios de aceite

- [ ] Sem assign acidental ao scrollar strip

---

## Verificação do grupo

Checklist completo; testes API verdes.

## Handoff

Change pronta para archive após merge.
