# Task 3 — Eligibility qualified rules

**Change:** `assignment-rules-v2`  
**Grupo:** 3 de 8  
**Pré-requisitos:** [task-01](./task-01-schema-and-migration.md)  
**Desbloqueia:** [task-04](./task-04-eligible-participants-api.md)

## Objetivo do grupo

Implementar elegibilidade de oração/leitor para batizado qualificado e atualizar seed/validação.

## Contexto para o subagent

- `validateHardAssignRules`: `apps/api/src/schedule/assign-rules.ts`
- `ParticipantRules` type — adicionar `qualified: boolean`
- `toParticipantRules` em `schedule.service.ts`
- Seed: `packages/database/prisma/seed.ts` linhas 64–88 (orações), 196–208 (estudo)
- Códigos: `ORACAO_INICIAL`, `ORACAO_FINAL`, `ESTUDO_BIBLICO`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/assign-rules.ts` | editar |
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `packages/database/prisma/seed.ts` | editar |
| `apps/api/src/schedule/assign-rules.spec.ts` | editar |

---

## 3.1 — `isPrivilegeEligibleForPart()`

### O que fazer

```typescript
const PRAYER_CODES = ['ORACAO_INICIAL', 'ORACAO_FINAL'] as const;

export function isPrivilegeEligibleForPart(input: {
  partTypeCode: string;
  role: AssignmentRole;
  privilege: Privilege;
  qualified: boolean;
}): boolean {
  const { partTypeCode, role, privilege, qualified } = input;

  if (PRAYER_CODES.includes(partTypeCode as any)) {
    return (
      privilege === Privilege.ELDER ||
      privilege === Privilege.MINISTERIAL_SERVANT ||
      (privilege === Privilege.BAPTIZED && qualified)
    );
  }

  if (partTypeCode === STUDY_PART_CODE && role === AssignmentRole.LEITOR) {
    return (
      privilege === Privilege.ELDER ||
      privilege === Privilege.MINISTERIAL_SERVANT ||
      (privilege === Privilege.BAPTIZED && qualified)
    );
  }

  if (partTypeCode === STUDY_PART_CODE && role === AssignmentRole.DIRIGENTE) {
    return (
      privilege === Privilege.ELDER ||
      privilege === Privilege.MINISTERIAL_SERVANT
    );
  }

  return true; // defer to partType.privileges for other parts
}
```

Integrar em `validateHardAssignRules` **antes** ou **substituindo** check genérico `partType.privileges.includes` para esses casos especiais.

### Critérios de aceite

- [ ] Batizado não qualificado → `PRIVILEGE_NOT_ALLOWED` em oração
- [ ] Batizado qualificado → passa

---

## 3.2 — ParticipantRules.qualified

### O que fazer

```typescript
export type ParticipantRules = {
  // ...existing
  qualified: boolean;
};
```

Atualizar `toParticipantRules(p)` para incluir `p.qualified`.

### Critérios de aceite

- [ ] Eligible endpoint e assign usam `qualified`

---

## 3.3 — Seed update

### O que fazer

Para `ORACAO_INICIAL`, `ORACAO_FINAL`:

```typescript
privileges: [Privilege.ELDER, Privilege.MINISTERIAL_SERVANT, Privilege.BAPTIZED],
```

`ESTUDO_BIBLICO` mantém `[ELDER, MINISTERIAL_SERVANT, BAPTIZED]` no array seed — runtime filtra batizado por `qualified`.

Rodar seed idempotente ou migration de dados PartType.

### Critérios de aceite

- [ ] Seed atualizado; validação runtime é fonte de verdade para qualificado

---

## 3.4 — Tests

### O que fazer

Em `assign-rules.spec.ts`:

- Batizado + qualified=false + ORACAO → reject
- Batizado + qualified=true + ORACAO → pass (demais regras ok)
- Batizado + qualified=true + DIRIGENTE estudo → reject
- Ancião + ORACAO → pass

### Critérios de aceite

- [ ] Testes passam

### Não fazer

- Não alterar regra FEMALE_WEEK_LIMIT

---

## Verificação do grupo

```bash
cd apps/api && npm test -- assign-rules
```

## Handoff

Elegibilidade com qualificado pronta para API enriched e picker.
