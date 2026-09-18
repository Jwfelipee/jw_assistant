| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-schema-and-public-link-settings.md](./tasks/task-01-schema-and-public-link-settings.md) |
| 2 | [task-02-iso-week-helpers.md](./tasks/task-02-iso-week-helpers.md) |
| 3 | [task-03-public-schedule-api.md](./tasks/task-03-public-schedule-api.md) |
| 4 | [task-04-public-web-pages.md](./tasks/task-04-public-web-pages.md) |
| 5 | [task-05-settings-public-links-ui.md](./tasks/task-05-settings-public-links-ui.md) |

**Ordem de execução:** 1 → 2 → 3 → (4 ∥ 5, após 3)

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · [specs/public-schedule-links/spec.md](./specs/public-schedule-links/spec.md) · [specs/congregation-settings/spec.md](./specs/congregation-settings/spec.md)

## 1. Schema and public link settings

📄 [Detalhes](./tasks/task-01-schema-and-public-link-settings.md)

- [x] 1.1 Add four `publicLink*Enabled` boolean fields to `CongregationSettings` in Prisma schema with migration (default `true`)
- [x] 1.2 Extend `SettingsService`, DTO, and controller to read/write the four flags
- [x] 1.3 Update `apps/web/src/lib/settings.ts` types and settings form payload
- [x] 1.4 Add unit tests for settings GET/PATCH including new fields

## 2. ISO week resolution helpers

📄 [Detalhes](./tasks/task-02-iso-week-helpers.md)

- [x] 2.1 Create `packages/shared/src/calendar/iso-week.ts` with `isoWeekBoundsForDate` and `addIsoWeeks`
- [x] 2.2 Export helpers from `@jw/shared` index
- [x] 2.3 Add unit tests covering week boundaries, year rollover, and post-meeting-day scenario

## 3. Public schedule API

📄 [Detalhes](./tasks/task-03-public-schedule-api.md)

- [x] 3.1 Create `PublicScheduleService` with scope resolvers and sanitized DTO mapper (no phone)
- [x] 3.2 Implement `PublicScheduleController` with four `@Public()` GET endpoints
- [x] 3.3 Return 404 when link disabled; set `Cache-Control: public, max-age=60`
- [x] 3.4 Add service/controller unit tests for all scopes and disabled-link behavior

## 4. Public web pages and middleware

📄 [Detalhes](./tasks/task-04-public-web-pages.md)

- [ ] 4.1 Add four paths to `PUBLIC_PATHS` in `apps/web/src/middleware.ts`
- [ ] 4.2 Create `(public)` route group with minimal layout and four pages
- [ ] 4.3 Build `PublicScheduleListView` (mobile list, empty slots as `—`)
- [ ] 4.4 Build `PublicSchedulePrintView` (S-140-like HTML) with list/print toggle and `window.print()`
- [ ] 4.5 Handle disabled-link and empty-schedule states; smoke test all four URLs unauthenticated

## 5. Settings UI for public links

📄 [Detalhes](./tasks/task-05-settings-public-links-ui.md)

- [ ] 5.1 Create `PublicLinksSection` component with URL display, copy button, and enable toggle per link
- [ ] 5.2 Integrate section into `/settings` page below congregation form
- [ ] 5.3 Persist toggles via existing `PATCH /settings`; show visual state when link is disabled
- [ ] 5.4 Smoke test: copy URL, disable link, verify public page shows disabled state
