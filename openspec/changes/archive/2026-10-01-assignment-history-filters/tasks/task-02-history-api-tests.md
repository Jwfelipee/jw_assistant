# Task 2 — History API tests

**Change:** `assignment-history-filters`  
**Grupo:** 2 de 4  
**Pré-requisitos:** [task-01](./task-01-history-api-filters.md)  
**Desbloqueia:** [task-04](./task-04-history-filters-smoke.md)

## Objetivo do grupo

Cobrir com testes automatizados os novos filtros e o modo `lastPerParticipant`, evitando regressão na listagem flat.

## Contexto para o subagent

- Ver padrão de testes em `apps/api/src/` (ex.: `public-schedule.service.spec.ts`, `schedule.service` se existir)
- Preferir testes de **service** com Prisma mock ou banco de teste conforme convenção do repo
- Seed mental: participantes M/F, slots em datas diferentes, part types Presidente/Joias/ESTUDO_BIBLICO

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.spec.ts` | criar ou editar |
| (opcional) `apps/api/src/schedule/history-query.dto.spec.ts` | criar |

---

## 2.1 — Testes sex e partTypeId

### O que fazer

Cenários mínimos:

1. Dois slots Joias (mesmo tipo), um M um F → `sex=FEMALE` retorna só o da irmã.
2. `partTypeId` de Presidente → não retorna Joias.

### Critérios de aceite

- [ ] Testes passam no CI local (`pnpm`/`npm` script de test da api)

---

## 2.2 — Testes studyRole

### O que fazer

Com part type Estudo e dois slots na mesma semana (DIRIGENTE + LEITOR):

- `studyRole=DIRIGENTE` → 1 item, role DIRIGENTE
- `studyRole=LEITOR` → 1 item, role LEITOR
- `studyRole=BOTH` → 2 itens (ou 1 se mesmo participante em ambos — usar participantes distintos no fixture)

### Critérios de aceite

- [ ] BOTH inclui ambos os papéis, nunca TITULAR de outras partes

---

## 2.3 — Testes lastPerParticipant

### O que fazer

Fixture: participante P com Joias em 2025-01-01 e 2025-06-01; outro Q com uma Joias.

- Flat: 3 linhas (ou 2 se só P e Q)
- `lastPerParticipant=true` + `from=2025-01-01&to=2025-12-31` → 2 linhas; P mostra 2025-06-01
- `lastPerParticipant=true` sem datas → P mostra 2025-06-01 globalmente
- `total` no modo agregado = número de participantes

### Critérios de aceite

- [ ] Ordem por meetingDate desc verificada no primeiro item
- [ ] Paginação: `limit=1` retorna 1 participante

### Não fazer

- Não depender de seed de produção

---

## Verificação do grupo

Rodar suite de testes da API.

## Handoff para próxima task

Confiança para UI e smoke manual.
