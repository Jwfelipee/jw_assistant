| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-last-assignment-on-eligible-api.md](./tasks/task-01-last-assignment-on-eligible-api.md) |
| 2 | [task-02-eligible-last-assignment-tests.md](./tasks/task-02-eligible-last-assignment-tests.md) |
| 3 | [task-03-picker-filters-ui.md](./tasks/task-03-picker-filters-ui.md) |
| 4 | [task-04-picker-assignment-strip-ui.md](./tasks/task-04-picker-assignment-strip-ui.md) |
| 5 | [task-05-picker-filters-smoke.md](./tasks/task-05-picker-filters-smoke.md) |

**Ordem de execução:** 1 → 2 → (3 ∥ 4 após 1) → 5

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · [specs/assignment-schedule/spec.md](./specs/assignment-schedule/spec.md)

## 1. Last assignment on eligible API

📄 [Detalhes](./tasks/task-01-last-assignment-on-eligible-api.md)

- [x] 1.1 Add `lastAssignment` to eligible participant view types (API + web)
- [x] 1.2 Batch-load global last assignment per eligible participant in `getEligibleParticipants`
- [x] 1.3 Expose fields in JSON response and update `EligibleParticipant` in `schedule.ts`

## 2. Eligible last assignment tests

📄 [Detalhes](./tasks/task-02-eligible-last-assignment-tests.md)

- [x] 2.1 Test participant with history receives correct `lastAssignment`
- [x] 2.2 Test never-assigned participant has `lastAssignment: null`

## 3. Picker filters UI

📄 [Detalhes](./tasks/task-03-picker-filters-ui.md)

- [ ] 3.1 Filter bar (sex, privilege, last role) inside dropdown
- [ ] 3.2 Per-slot filter state with restore and clear
- [ ] 3.3 Apply filters in eligible list pipeline with empty states

## 4. Picker assignment strip UI

📄 [Detalhes](./tasks/task-04-picker-assignment-strip-ui.md)

- [x] 4.1 `ParticipantAssignmentStrip` with fixed height and internal scroll
- [x] 4.2 Lazy load assignments; stopPropagation on strip controls
- [x] 4.3 Integrate strip into `EligibleOption` without breaking assign-on-click

## 5. Picker filters smoke

📄 [Detalhes](./tasks/task-05-picker-filters-smoke.md)

- [ ] 5.1 Week view: filters + last-role + slot restore/clear
- [ ] 5.2 Mobile-width: strip scroll and assign still works
