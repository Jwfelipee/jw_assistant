| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-schema-and-migration.md](./tasks/task-01-schema-and-migration.md) |
| 2 | [task-02-count-taxonomy-and-recalc.md](./tasks/task-02-count-taxonomy-and-recalc.md) |
| 3 | [task-03-eligibility-qualified-rules.md](./tasks/task-03-eligibility-qualified-rules.md) |
| 4 | [task-04-eligible-participants-api.md](./tasks/task-04-eligible-participants-api.md) |
| 5 | [task-05-female-alert-inline-confirm.md](./tasks/task-05-female-alert-inline-confirm.md) |
| 6 | [task-06-participant-form.md](./tasks/task-06-participant-form.md) |
| 7 | [task-07-participant-picker-counts.md](./tasks/task-07-participant-picker-counts.md) |
| 8 | [task-08-week-view-whatsapp-navigation.md](./tasks/task-08-week-view-whatsapp-navigation.md) |

**Ordem de execução:** 1 → 2 → 3 → 4 → (5 ∥ 6) → 7 → 8

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · [specs/participants/spec.md](./specs/participants/spec.md) · [specs/assignment-schedule/spec.md](./specs/assignment-schedule/spec.md)

## 1. Schema and migration

📄 [Detalhes](./tasks/task-01-schema-and-migration.md)

- [x] 1.1 Add `qualified`, `presidenteCount`, `oracaoCount`, `ministerioCount` to Prisma schema and shared types
- [x] 1.2 Create migration and update DTOs (`CreateParticipantDto`, `UpdateParticipantDto`, `ParticipantInput`)
- [x] 1.3 Update `participants.service.ts` to persist `qualified` (ignore when privilege ≠ BAPTIZED)

## 2. Count taxonomy and recalculation

📄 [Detalhes](./tasks/task-02-count-taxonomy-and-recalc.md)

- [x] 2.1 Implement `resolveCountCategory()` and counter field mapping in `assign-rules.ts`
- [x] 2.2 Refactor `incrementCounters` / `decrementCounters` in `schedule.service.ts`
- [x] 2.3 Add idempotent historical recalculation script/migration step
- [x] 2.4 Unit tests for category resolution (study leitor→titular, FSM male→ministerio, prayers→oracao)

## 3. Eligibility qualified rules

📄 [Detalhes](./tasks/task-03-eligibility-qualified-rules.md)

- [x] 3.1 Add `isPrivilegeEligibleForPart()` for prayer, book reader, and conductor
- [x] 3.2 Integrate into `validateHardAssignRules` with `qualified` on `ParticipantRules`
- [x] 3.3 Update seed privileges for `ORACAO_*` and `ESTUDO_BIBLICO` LEITOR path
- [x] 3.4 Tests: qualified/unqualified batizado for prayer and leitor; conductor unchanged

## 4. Eligible participants API enriched

📄 [Detalhes](./tasks/task-04-eligible-participants-api.md)

- [x] 4.1 Add aggregation query for month/total counts per category per participant
- [x] 4.2 Extend `GET /slots/:id/eligible-participants` response with counts, `sortCategory`, `assignedThisWeek`
- [x] 4.3 Implement sort: week-assigned last, then relevant count asc (month, then total, then name)
- [x] 4.4 Update `sortSuggestionCandidates` to use new categories
- [x] 4.5 Update web types in `apps/web/src/lib/schedule.ts`

## 5. Female alert and inline confirmation

📄 [Detalhes](./tasks/task-05-female-alert-inline-confirm.md)

- [ ] 5.1 Add `FEMALE_REPEAT_MONTH` soft alert in `collectSoftAlerts` (always for female, any privilege)
- [ ] 5.2 Move confirmation UI inline per slot on week page (keep optional page-level fallback)
- [ ] 5.3 Fix empty-picker UX: show pending participant name until confirm or cancel

## 6. Participant form

📄 [Detalhes](./tasks/task-06-participant-form.md)

- [x] 6.1 Default privilege to `BAPTIZED` on create form
- [x] 6.2 Add Qualificado checkbox visible only when privilege is Batizado
- [x] 6.3 Show qualified on participant detail/edit pages

## 7. Participant picker counts

📄 [Detalhes](./tasks/task-07-participant-picker-counts.md)

- [ ] 7.1 Render compact Este mês / Total table per eligible row
- [ ] 7.2 Column order: sortCategory first, then Titular → Dirigente → Ajudante → Presidente → Ministério → Oração; hide all-zero columns
- [ ] 7.3 Expose `onOpenChange` from picker for swipe guard

## 8. Week view WhatsApp and navigation

📄 [Detalhes](./tasks/task-08-week-view-whatsapp-navigation.md)

- [ ] 8.1 Create `whatsapp.ts` helper with phone normalization and message builder
- [ ] 8.2 Add WhatsApp button beside Sugerir/Limpar when assignee has phone
- [ ] 8.3 Week footer: prev/next links within month only
- [ ] 8.4 Touch-only horizontal swipe between weeks; disabled on last week, first week, and when picker open
