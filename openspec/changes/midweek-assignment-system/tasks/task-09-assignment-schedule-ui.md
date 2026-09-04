# Task 9 — Assignment schedule UI

**Change:** `midweek-assignment-system`  
**Grupo:** 9 of 11  
**Pré-requisitos:** [8. Schedule engine](./task-08-assignment-schedule-engine-and-api.md)  
**Desbloqueia:** polish PWA (navegação já pode apontar para estas rotas)

## Objetivo do grupo

Telas mobile-first para programar mês/semana, dashboard do próximo mês e histórico com filtros.

## Contexto para o subagent

- Specs: `assignment-schedule`, `pwa-shell` (usar layout responsivo; nav final no grupo 11).
- Fluxo crítico: abrir próximo mês → preencher slots com sugestões e alertas.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/app/(app)/page.tsx` (home) | criar/editar |
| `apps/web/app/(app)/schedule/**` | criar |
| `apps/web/app/(app)/history/**` | criar |

---

## 9.1 — Month/week schedule screens

### O que fazer

- Visão do mês com lista de semanas/`meetingDate`.
- Detalhe da semana por tópicos; picker de participante por slot; mostrar sugestão; confirmar apesar de warnings.
- Add/remove partes FSM/NVC onde permitido; editar tema texto.

### Critérios de aceite

- [ ] Usuário consegue designar titular e ajudante em parte FSM
- [ ] Alertas visíveis antes de confirmar
- [ ] Bloqueios hard mostram erro claro em pt-BR

### Não fazer

- Não gerar PDF nesta task (só link placeholder ok se grupo 10 ainda não mergeou)

---

## 9.2 — Home dashboard next month

### O que fazer

- Card/CTA “Programar próximo mês” usando `GET /schedule/next-month`.
- Mostrar também alertas de ausência (se grupo 6 já entregue).

### Critérios de aceite

- [ ] CTA navega para o month ensure+view correto

### Não fazer

- Não auto-gerar meses passados sem necessidade

---

## 9.3 — History tab

### O que fazer

- Tela de histórico com busca e filtros (participante, datas, tópico, papel).
- Reutilizar no detalhe do participante se aplicável.

### Critérios de aceite

- [ ] Busca por nome filtra resultados
- [ ] Usável em viewport mobile

### Não fazer

- Não exportar CSV neste escopo

---

## Verificação do grupo

Smoke E2E manual: login → next month → assign → history.

## Handoff para próxima task

UI pronta para botão de export PDF.
