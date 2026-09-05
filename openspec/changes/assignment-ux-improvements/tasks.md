| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-eligible-participants-api.md](./tasks/task-01-eligible-participants-api.md) |
| 2 | [task-02-part-title-and-suggest-api.md](./tasks/task-02-part-title-and-suggest-api.md) |
| 3 | [task-03-participant-picker-component.md](./tasks/task-03-participant-picker-component.md) |
| 4 | [task-04-week-schedule-ux-integration.md](./tasks/task-04-week-schedule-ux-integration.md) |

**Ordem de execução:** 1 → 2 → (3 ∥ pode iniciar após 1 com mock) → 4

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · [specs/assignment-schedule/spec.md](./specs/assignment-schedule/spec.md)

## 1. Eligible participants API

📄 [Detalhes](./tasks/task-01-eligible-participants-api.md)

- [x] 1.1 Extract shared eligibility builder from `suggestForPart` in `schedule.service.ts`
- [x] 1.2 Implement `GET /slots/:id/eligible-participants` with eligible and ineligibleVisible lists
- [x] 1.3 Add unit tests for visibility rules (hidden vs visible-disabled reason codes)

## 2. Part title and suggest API

📄 [Detalhes](./tasks/task-02-part-title-and-suggest-api.md)

- [x] 2.1 Implement `PATCH /schedule/parts/:partId` for title update
- [x] 2.2 Add optional `excludeParticipantId` query param to `GET /parts/:id/suggest`
- [x] 2.3 Add API tests / smoke for patch title and suggest exclusion

## 3. Participant picker component

📄 [Detalhes](./tasks/task-03-participant-picker-component.md)

- [ ] 3.1 Create `ParticipantPicker` combobox component with search and disabled ineligible section
- [ ] 3.2 Add `listEligibleParticipants(slotId)` to `apps/web/src/lib/schedule.ts`
- [ ] 3.3 Ensure mobile-friendly touch targets and keyboard navigation

## 4. Week schedule UX integration

📄 [Detalhes](./tasks/task-04-week-schedule-ux-integration.md)

- [ ] 4.1 Replace native `<select>` with `ParticipantPicker` and auto-assign on select
- [ ] 4.2 Update Sugerir to assign immediately and support re-suggest
- [ ] 4.3 Remove Designar button; keep Limpar and soft-alert confirmation flow
- [ ] 4.4 Add inline theme editing for existing week parts
- [ ] 4.5 Smoke test: login → week → search picker → assign → edit theme → suggest again
