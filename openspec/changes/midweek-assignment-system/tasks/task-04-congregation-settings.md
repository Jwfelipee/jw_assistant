# Task 4 — Congregation settings

**Change:** `midweek-assignment-system`  
**Grupo:** 4 of 11  
**Pré-requisitos:** [3. Auth single-user](./task-03-auth-single-user.md)  
**Desbloqueia:** [8. Assignment schedule engine](./task-08-assignment-schedule-engine-and-api.md), [10. S-140 PDF](./task-10-s140-pdf-export.md)

## Objetivo do grupo

CRUD de nome da congregação e dia da reunião, com helper de `meetingDate`.

## Contexto para o subagent

- Spec: `../specs/congregation-settings/spec.md`
- Design D3: `meetingDate` = weekday configurado dentro da semana; week start = segunda ISO.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/settings/**` | criar |
| `packages/shared/src/calendar/**` | criar helpers |
| `apps/web` settings page | criar |

---

## 4.1 — Settings API

### O que fazer

- `GET /settings` → `{ congregationName, meetingWeekday }`
- `PATCH /settings` valida weekday enum e nome não vazio.
- Singleton: sempre um registro (seed).

### Critérios de aceite

- [ ] PATCH persiste e GET reflete mudança
- [ ] Weekday inválido → 400

### Não fazer

- Não permitir múltiplas congregações

---

## 4.2 — Settings UI + meetingDate helper

### O que fazer

- UI para editar nome e dia (select Segunda…Domingo).
- Função compartilhada `computeMeetingDate(weekStartDate: Date, weekday): Date`.
- Documentar exemplo: weekStart 2026-09-07 + THURSDAY → 2026-09-10.

### Critérios de aceite

- [ ] UI salva settings
- [ ] Teste unitário do helper cobre o cenário da spec

### Não fazer

- Não regenerar todas as semanas automaticamente neste grupo além de expor o helper (regeneração fica no schedule)

---

## Verificação do grupo

PATCH + teste do helper + UI.

## Handoff para próxima task

Settings prontos para geração de semanas e PDF.
