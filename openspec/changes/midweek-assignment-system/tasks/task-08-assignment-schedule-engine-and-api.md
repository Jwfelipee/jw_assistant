# Task 8 — Assignment schedule engine and API

**Change:** `midweek-assignment-system`  
**Grupo:** 8 of 11  
**Pré-requisitos:** [4. Settings](./task-04-congregation-settings.md), [6. Absences](./task-06-absences.md), [7. Catalog](./task-07-assignment-catalog.md)  
**Desbloqueia:** [9. Schedule UI](./task-09-assignment-schedule-ui.md), [10. PDF](./task-10-s140-pdf-export.md)

## Objetivo do grupo

Motor de calendário/designações: gerar mês/semanas, templates, assign com regras/alertas/sugestões, histórico e next-month.

## Contexto para o subagent

- Spec: `../specs/assignment-schedule/spec.md`
- Design D3, D4, D6.
- Semana ∈ mês do `weekStartDate` (segunda ISO), mesmo se `meetingDate` cair no mês seguinte.
- ♀ ≤1 designação/semana; open-ended absence bloqueia; alertas soft configuráveis; sugestão least-count para TITULAR/AJUDANTE.
- Contadores: papel + ministryPractice (FSM + Leitura da Bíblia).
- 1 participante → papel TITULAR (exceto estudo DIRIGENTE/LEITOR).

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/**` | criar |
| `packages/shared` calendar/week generators | criar/editar |
| testes unitários do engine | criar |

---

## 8.1 — Generate bimester/month/weeks

### O que fazer

- `POST /schedule/months/:yearMonth/ensure` cria bimestre/mês e semanas cujo start cai no mês.
- Calcular `meetingDate` via settings weekday.
- Endpoint `GET /schedule/months/:yearMonth`.

### Critérios de aceite

- [x] Cenário spec: weekStart 2026-09-28 + Thursday meeting → month 2026-09, meetingDate 2026-10-01
- [x] Idempotente: chamar ensure duas vezes não duplica semanas

### Não fazer

- Não gerar PDF aqui

---

## 8.2 — Week template instantiation

### O que fazer

Ao criar semana, criar WeekParts + slots:

- OUT: Presidente, Oração inicial, Oração final
- TREASURES: 3 fixas
- MINISTRY: default 3 a partir do catálogo FSM
- CHRISTIAN_LIFE: default 2 + Estudo (DIRIGENTE+LEITOR) sempre por último
- Endpoints para add/remove partes FSM/NVC (exceto estudo)

### Critérios de aceite

- [x] Semana nova já vem com estrutura S-140
- [x] Remover estudo → rejeitado

### Não fazer

- Não exigir temas da Apostila (tema texto livre opcional)

---

## 8.3 — Assign / unassign / suggest / alerts / counters

### O que fazer

- `PUT /slots/:id/assign` { participantId, confirm?: boolean }
- Validações hard: sexo, privilégio, ausência, ♀ 2ª na semana, open-ended
- Alertas soft no payload: repeat-month (por AlertConfig), mixed-sex (exceto association)
- `GET /parts/:id/suggest?role=TITULAR|AJUDANTE` → menor contador elegível
- Unassign decrementa contadores corretamente
- Incrementa ministryPractice quando PartType.countsAsMinistryPractice

### Critérios de aceite

- [x] Sugestão retorna least TITULAR
- [x] Segunda designação feminina na semana → 400
- [x] Mixed pair sem associação → warning; com associação → sem warning
- [x] Publicador com alerta mês → warning

### Não fazer

- Não auto-preencher todas as partes sem ação do usuário

---

## 8.4 — History + next month helper

### O que fazer

- `GET /assignments/history?q=&from=&to=&participantId=&topic=&role=`
- `GET /schedule/next-month` → yearMonth sugerido sem programação completa + link útil

### Critérios de aceite

- [x] Filtro por nome funciona
- [x] next-month aponta para mês futuro sem schedule (ou incompleto, conforme regra documentada)

### Não fazer

- Não paginar de forma quebrada sem total/count — incluir paginação simples

---

## Verificação do grupo

Testes unitários dos casos de calendário + smoke assign via curl.

## Handoff para próxima task

API de schedule pronta para UI e PDF.
