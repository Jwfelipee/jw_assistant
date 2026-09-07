| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-month-horizon-and-list-api.md](./tasks/task-01-month-horizon-and-list-api.md) |
| 2 | [task-02-schedule-month-hub-ui.md](./tasks/task-02-schedule-month-hub-ui.md) |
| 3 | [task-03-history-sub-tabs.md](./tasks/task-03-history-sub-tabs.md) |
| 4 | [task-04-s140-pdf-fidelity.md](./tasks/task-04-s140-pdf-fidelity.md) |
| 5 | [task-05-add-part-modal.md](./tasks/task-05-add-part-modal.md) |
| 6 | [task-06-part-reorder-drag.md](./tasks/task-06-part-reorder-drag.md) |

**Ordem de execução:** 1 → (2 ∥ 3 ∥ 4) → (5 ∥ 6, após 1 para reorder API em 6)

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · [specs/assignment-schedule/spec.md](./specs/assignment-schedule/spec.md) · [specs/s140-pdf-export/spec.md](./specs/s140-pdf-export/spec.md)

## 1. Month horizon and list API

📄 [Detalhes](./tasks/task-01-month-horizon-and-list-api.md)

- [x] 1.1 Extract `monthCompleteness` to a reusable method and add `ensureHorizon(now?)` in `schedule.service.ts`
- [x] 1.2 Implement `POST /schedule/horizon/ensure` and `GET /schedule/months` in controller + DTOs
- [x] 1.3 Add `listScheduleMonths` and `ensureHorizon` helpers to `apps/web/src/lib/schedule.ts`
- [x] 1.4 Add unit tests for horizon idempotency and month list status fields

## 2. Schedule month hub UI

📄 [Detalhes](./tasks/task-02-schedule-month-hub-ui.md)

- [x] 2.1 Replace `/schedule` redirect with month hub page (planning + past groups, status badges)
- [x] 2.2 Call `ensureHorizon` on hub mount; show loading and error states
- [x] 2.3 Add "Todos os meses" back link on `/schedule/[yearMonth]/page.tsx`
- [x] 2.4 Smoke test: hub → pick month → week → back to hub

## 3. History sub-tabs

📄 [Detalhes](./tasks/task-03-history-sub-tabs.md)

- [x] 3.1 Create `HistoryTabs` with URL state `?view=assignments|months`
- [x] 3.2 Move current history content to "Por designação" sub-tab
- [x] 3.3 Implement "Por mês" sub-tab using `GET /schedule/months` (past + current, status badges, links)
- [x] 3.4 Smoke test: switch tabs, open month from archive

## 4. S-140 PDF fidelity

📄 [Detalhes](./tasks/task-04-s140-pdf-fidelity.md)

- [x] 4.1 Extend `s140-model.ts` with numbering, durations map, and enriched week view types
- [x] 4.2 Rewrite `s140-document.tsx` — one page per week, tabular layout matching `S-140.docx`
- [x] 4.3 Update `s140-model.spec.ts` and add visual regression checklist in task notes
- [x] 4.4 Export seed month PDF and verify against `S-140.docx` structure

## 5. Add part modal

📄 [Detalhes](./tasks/task-05-add-part-modal.md)

- [ ] 5.1 Create `AddWeekPartModal` component (section preset, type select, optional title)
- [ ] 5.2 Add `+` buttons to FSM and NVC section headers in week page; remove bottom form
- [ ] 5.3 Smoke test: add FSM and NVC parts via modal from each section

## 6. Part reorder drag

📄 [Detalhes](./tasks/task-06-part-reorder-drag.md)

- [ ] 6.1 Implement `PATCH /schedule/weeks/:weekId/parts/reorder` with validation and sortOrder recalculation
- [ ] 6.2 Add `@dnd-kit/core` and `@dnd-kit/sortable` to `apps/web`
- [ ] 6.3 Create `SortableWeekParts` for FSM and NVC lists with drag handles
- [ ] 6.4 Add API tests for reorder constraints and smoke test drag on week page
