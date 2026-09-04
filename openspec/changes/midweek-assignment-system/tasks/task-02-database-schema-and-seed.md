# Task 2 — Database schema and seed

**Change:** `midweek-assignment-system`  
**Grupo:** 2 of 11  
**Pré-requisitos:** [1. Monorepo bootstrap](./task-01-monorepo-bootstrap.md)  
**Desbloqueia:** grupos 3–10

## Objetivo do grupo

Persistência Prisma completa do domínio + seed (admin, settings, tipos de sistema e defaults FSM/NVC).

## Contexto para o subagent

- Specs: `../specs/participants`, `absences`, `assignment-catalog`, `assignment-schedule`, `congregation-settings`, `auth-single-user`.
- Design D3–D7: hierarquia Bimestre→Mês→Semana; `meetingDate`; PartType vs WeekPart vs AssignmentSlot; privilégios; ausências.
- Semana pertence ao mês do **week start**; início de semana = **segunda (ISO)**.
- Contagem separada: `ministryPracticeCount` (FSM + Leitura da Bíblia).

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `packages/database/prisma/schema.prisma` | criar |
| `packages/database/prisma/migrations/**` | criar |
| `packages/database/prisma/seed.ts` | criar |
| `packages/database/src/index.ts` | criar (export client) |
| `packages/shared/src/**` | editar (enums alinhados ao schema) |

### Modelos mínimos esperados

- `User` (email, passwordHash)
- `CongregationSettings` (name, meetingWeekday, singleton)
- `Participant` (name, phone?, sex, privilege, rolePreference, counters…)
- `ParticipantAssociation` (aId, bId, reason)
- `Absence` (startsOn, endsOn?, justification?, status, acknowledgedAt?)
- `PartType` (topic, code, label, allowedSexes, slotMode ONE|TWO, roles, privileges[], isSystem, countsAsMinistryPractice, deletable)
- `AlertConfig` (privilege → repeatMonthAlert enabled)
- `Bimester`, `Month`, `Week` (weekStartDate, meetingDate)
- `WeekPart` (weekId, partTypeId, title/theme, sortOrder, topic)
- `AssignmentSlot` (weekPartId, role, participantId?)

Roles enum: `TITULAR | AJUDANTE | DIRIGENTE | LEITOR`  
Privileges: `ELDER | MINISTERIAL_SERVANT | REGULAR_PIONEER | REGULAR_PIONEER_SISTER | BAPTIZED | PUBLISHER`  
Topics: `OUT_OF_TOPIC | TREASURES | MINISTRY | CHRISTIAN_LIFE`

---

## 2.1 — Define Prisma schema

### O que fazer

- Escrever `schema.prisma` com modelos acima, índices úteis (participant name, week.meetingDate, slots by participant).
- Validar relações 1–2 slots por parte conforme `slotMode` (enforcement na API; schema permite 1..n slots).

### Critérios de aceite

- [ ] `prisma validate` passa
- [ ] Enums cobrem specs de privilégio/sexo/papéis

### Não fazer

- Não criar endpoints Nest neste grupo

---

## 2.2 — Migration e client export

### O que fazer

- Gerar migration inicial.
- Exportar `PrismaClient` singleton de `packages/database`.
- Scripts `db:migrate`, `db:seed` no package/root.

### Critérios de aceite

- [ ] Migration aplica em Postgres local
- [ ] Apps conseguem depender de `@jw/database`

### Não fazer

- Não usar `db push` como único fluxo se o projeto já adota migrations — preferir migrate

---

## 2.3 — Seed

### O que fazer

Seed deve criar:

1. User admin a partir de env
2. CongregationSettings default (nome placeholder, weekday THURSDAY ou configurável)
3. PartTypes sistema: Presidente, Oração inicial, Oração final, Tesouros, Joias, Leitura da Bíblia (ministryPractice=true), Estudo bíblico
4. ≥3 FSM defaults (misturar 1 e 2 participantes / regras de sexo de exemplo)
5. ≥2 NVC defaults + estudo já como sistema
6. AlertConfig default (ex.: alertar Batizado e Publicador)

### Critérios de aceite

- [ ] `pnpm db:seed` é idempotente ou documentado como re-run safe
- [ ] Tipos `isSystem` presentes e não deletáveis por convenção

### Não fazer

- Não importar Apostila/Workbook

---

## Verificação do grupo

Migrate + seed; inspecionar tabelas no Postgres.

## Handoff para próxima task

Schema e seed prontos para auth e módulos de domínio.
