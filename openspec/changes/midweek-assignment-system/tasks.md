| Grupo | Arquivo de detalhes |
|-------|---------------------|
| 1 | [task-01-monorepo-bootstrap.md](./tasks/task-01-monorepo-bootstrap.md) |
| 2 | [task-02-database-schema-and-seed.md](./tasks/task-02-database-schema-and-seed.md) |
| 3 | [task-03-auth-single-user.md](./tasks/task-03-auth-single-user.md) |
| 4 | [task-04-congregation-settings.md](./tasks/task-04-congregation-settings.md) |
| 5 | [task-05-participants.md](./tasks/task-05-participants.md) |
| 6 | [task-06-absences.md](./tasks/task-06-absences.md) |
| 7 | [task-07-assignment-catalog.md](./tasks/task-07-assignment-catalog.md) |
| 8 | [task-08-assignment-schedule-engine-and-api.md](./tasks/task-08-assignment-schedule-engine-and-api.md) |
| 9 | [task-09-assignment-schedule-ui.md](./tasks/task-09-assignment-schedule-ui.md) |
| 10 | [task-10-s140-pdf-export.md](./tasks/task-10-s140-pdf-export.md) |
| 11 | [task-11-pwa-shell-and-navigation.md](./tasks/task-11-pwa-shell-and-navigation.md) |

**Ordem de execução:** 1 → 2 → 3 → (4 ∥ 5 ∥ 7) → 6 → 8 → (9 ∥ 10) → 11

**Artefatos de contexto:** [proposal.md](./proposal.md) · [design.md](./design.md) · specs

## 1. Monorepo bootstrap

📄 [Detalhes](./tasks/task-01-monorepo-bootstrap.md)

- [ ] 1.1 Initialize pnpm workspace + Turborepo with `apps/web`, `apps/api`, `packages/database`, `packages/shared`
- [ ] 1.2 Scaffold Next.js App Router in `apps/web` and NestJS in `apps/api`
- [ ] 1.3 Add Docker Compose for PostgreSQL and root env example files
- [ ] 1.4 Wire TypeScript path aliases and shared package build so both apps import `@jw/shared`

## 2. Database schema and seed

📄 [Detalhes](./tasks/task-02-database-schema-and-seed.md)

- [ ] 2.1 Define Prisma schema for User, CongregationSettings, Participant, Absence, associations, counters, PartType, schedule hierarchy, WeekPart, AssignmentSlot, alert config
- [ ] 2.2 Create initial migration and Prisma client export from `packages/database`
- [ ] 2.3 Implement seed: admin user, default settings, system part types, default FSM/NVC types

## 3. Auth single-user

📄 [Detalhes](./tasks/task-03-auth-single-user.md)

- [ ] 3.1 Implement Nest auth module (login, logout, session/JWT cookie, guards)
- [ ] 3.2 Protect API routes except health and login
- [ ] 3.3 Build Next login page and auth session handling / route protection

## 4. Congregation settings

📄 [Detalhes](./tasks/task-04-congregation-settings.md)

- [ ] 4.1 Implement settings GET/PATCH API (congregation name, meeting weekday)
- [ ] 4.2 Build settings UI and wire weekday used for meetingDate computation helpers

## 5. Participants

📄 [Detalhes](./tasks/task-05-participants.md)

- [ ] 5.1 Implement participants CRUD API with privilege/sex validation and role preference
- [ ] 5.2 Implement participant associations API
- [ ] 5.3 Build participants list/detail/create/edit UI including counters and history entry point

## 6. Absences

📄 [Detalhes](./tasks/task-06-absences.md)

- [ ] 6.1 Implement absences API (create, history, reveal justification, acknowledge end, reactivate)
- [ ] 6.2 Implement eligibility helpers respecting dated vs open-ended absences
- [ ] 6.3 Build absence UI on participant detail and dashboard end-of-absence alerts

## 7. Assignment catalog

📄 [Detalhes](./tasks/task-07-assignment-catalog.md)

- [ ] 7.1 Implement PartType CRUD for FSM (and add/remove rules for NVC) with system-type protections
- [ ] 7.2 Build catalog management UI for FSM types (sex + 1/2 participants)

## 8. Assignment schedule engine and API

📄 [Detalhes](./tasks/task-08-assignment-schedule-engine-and-api.md)

- [ ] 8.1 Implement bimester/month/week generation (week belongs to month of week start; meetingDate from weekday)
- [ ] 8.2 Implement week template instantiation (Tesouros fixed, FSM/NVC defaults, out-of-topic parts)
- [ ] 8.3 Implement assign/unassign with validations, alerts, suggestions, and counter updates
- [ ] 8.4 Implement assignment history search/filter API and next-month helper endpoint

## 9. Assignment schedule UI

📄 [Detalhes](./tasks/task-09-assignment-schedule-ui.md)

- [ ] 9.1 Build month/week schedule screens with assign flows, alerts, and suggestions
- [ ] 9.2 Build home dashboard shortcut to next unscheduled month
- [ ] 9.3 Build assignments history tab with filters/search

## 10. S-140 PDF export

📄 [Detalhes](./tasks/task-10-s140-pdf-export.md)

- [ ] 10.1 Implement PDF renderer matching S-140 structure for a full month
- [ ] 10.2 Expose download endpoint and UI action on month view

## 11. PWA shell and navigation

📄 [Detalhes](./tasks/task-11-pwa-shell-and-navigation.md)

- [ ] 11.1 Configure PWA manifest, icons, and service worker
- [ ] 11.2 Implement bottom navigation (icons on mobile; icons + labels on larger breakpoints)
- [ ] 11.3 Ensure desktop layouts for all primary flows remain fully usable
