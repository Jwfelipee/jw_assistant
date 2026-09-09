# Task 1 — Schema and migration

**Change:** `assignment-rules-v2`  
**Grupo:** 1 de 8  
**Pré-requisitos:** change `midweek-assignment-system` implementada  
**Desbloqueia:** [task-02](./task-02-count-taxonomy-and-recalc.md), [task-03](./task-03-eligibility-qualified-rules.md), [task-06](./task-06-participant-form.md)

## Objetivo do grupo

Adicionar `qualified` e novos campos de contagem ao modelo `Participant`, com migration Prisma e DTOs atualizados.

## Contexto para o subagent

- Schema: `packages/database/prisma/schema.prisma` — model `Participant` (linhas ~82–103)
- Enums: `packages/shared/src/enums.ts`
- API DTOs: `apps/api/src/participants/dto/create-participant.dto.ts`, `update-participant.dto.ts`
- Service: `apps/api/src/participants/participants.service.ts`
- Web types: `apps/web/src/lib/participants.ts` — `ParticipantInput`

Campos atuais de contador: `titularCount`, `ajudanteCount`, `dirigenteCount`, `leitorCount`, `ministryPracticeCount`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `packages/database/prisma/schema.prisma` | editar |
| `packages/database/prisma/migrations/*` | criar |
| `packages/shared/src/index.ts` | editar (se exportar tipos) |
| `apps/api/src/participants/dto/*.ts` | editar |
| `apps/api/src/participants/participants.service.ts` | editar |
| `apps/web/src/lib/participants.ts` | editar |

---

## 1.1 — Prisma schema e shared types

### O que fazer

Adicionar ao model `Participant`:

```prisma
qualified       Boolean @default(false)
presidenteCount Int     @default(0)
oracaoCount     Int     @default(0)
ministerioCount Int     @default(0)
```

Manter `leitorCount` e `ministryPracticeCount` por compatibilidade (task 2 zera/recalcula).

Exportar tipo `AssignmentCountCategory` em `packages/shared` se necessário para web (pode ser string union).

Rodar `npx prisma migrate dev --name add-qualified-and-count-categories` na pasta `packages/database`.

### Critérios de aceite

- [ ] Migration aplicável sem erro
- [ ] `prisma generate` atualiza client

### Não fazer

- Não remover colunas antigas nesta task
- Não alterar regras de assign ainda

---

## 1.2 — DTOs e tipos web

### O que fazer

`CreateParticipantDto` / `UpdateParticipantDto`:

```typescript
@IsOptional()
@IsBoolean()
qualified?: boolean;
```

`ParticipantInput` em web:

```typescript
qualified?: boolean;
```

Responses de participante devem incluir `qualified` e novos contadores.

### Critérios de aceite

- [ ] POST/PATCH aceitam `qualified`
- [ ] GET participante retorna novos campos

---

## 1.3 — Service persist qualified

### O que fazer

Em `participants.service.ts` `create` e `update`:

- Se `privilege !== BAPTIZED`, forçar `qualified = false` no persist
- Se `privilege === BAPTIZED`, usar valor do DTO (default false)

### Critérios de aceite

- [ ] Mudar privilégio de Batizado para outro zera `qualified`
- [ ] Teste ou smoke manual de create/update

### Não fazer

- Não usar `qualified` em elegibilidade nesta task (task 3)

---

## Verificação do grupo

```bash
cd packages/database && npx prisma migrate deploy
cd apps/api && npm test -- participants
```

## Handoff para próxima task

Schema com `qualified` e campos `presidenteCount`, `oracaoCount`, `ministerioCount` prontos. Task 2 implementa `resolveCountCategory` e recálculo.
