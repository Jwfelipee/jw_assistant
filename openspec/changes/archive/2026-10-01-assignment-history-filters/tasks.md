| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-history-api-filters.md](./tasks/task-01-history-api-filters.md) |
| 2 | [task-02-history-api-tests.md](./tasks/task-02-history-api-tests.md) |
| 3 | [task-03-history-filters-ui.md](./tasks/task-03-history-filters-ui.md) |
| 4 | [task-04-history-filters-smoke.md](./tasks/task-04-history-filters-smoke.md) |

**Ordem de execução:** 1 → 2 → 3 → 4

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · [specs/assignment-schedule/spec.md](./specs/assignment-schedule/spec.md)

## 1. History API filters

📄 [Detalhes](./tasks/task-01-history-api-filters.md)

- [x] 1.1 Extend `HistoryQueryDto` with `sex`, `partTypeId`, `studyRole`, `lastPerParticipant`
- [x] 1.2 Implement filter predicates in `schedule.service.history` (sex, part type, study roles)
- [x] 1.3 Implement `lastPerParticipant` branch with DISTINCT ON and correct total count
- [x] 1.4 Extend `HistoryQuery` / `fetchAssignmentHistory` in `apps/web/src/lib/schedule.ts`

## 2. History API tests

📄 [Detalhes](./tasks/task-02-history-api-tests.md)

- [x] 2.1 Add service or e2e tests for sex and partTypeId filters
- [x] 2.2 Add tests for studyRole DIRIGENTE, LEITOR, BOTH
- [x] 2.3 Add tests for lastPerParticipant with and without date range

## 3. History filters UI

📄 [Detalhes](./tasks/task-03-history-filters-ui.md)

- [x] 3.1 Load catalog part types and build designation dropdown with “Todas as designações”
- [x] 3.2 Add sex filter and last-per-participant checkbox
- [x] 3.3 Add Estudo bíblico role control (Dirigente / Leitor / Dirigente e leitor)
- [x] 3.4 Remove standalone topic filter; wire new params to API

## 4. History filters smoke

📄 [Detalhes](./tasks/task-04-history-filters-smoke.md)

- [x] 4.1 Manual smoke: sex + Joias + última por participante com período
- [x] 4.2 Manual smoke: Estudo bíblico papéis e paginação
