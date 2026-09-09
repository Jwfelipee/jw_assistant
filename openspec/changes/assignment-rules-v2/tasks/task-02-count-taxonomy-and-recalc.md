# Task 2 — Count taxonomy and recalculation

**Change:** `assignment-rules-v2`  
**Grupo:** 2 de 8  
**Pré-requisitos:** [task-01](./task-01-schema-and-migration.md)  
**Desbloqueia:** [task-04](./task-04-eligible-participants-api.md)

## Objetivo do grupo

Implementar mapeamento parte+papel→categoria de contagem, refatorar increment/decrement, e recalcular histórico.

## Contexto para o subagent

- Regras: `apps/api/src/schedule/assign-rules.ts` — `counterKeyForRole`, `getRoleCounter`
- Service: `apps/api/src/schedule/schedule.service.ts` — `incrementCounters`, `decrementCounters`, `assignSlot`, `unassignSlot`
- Seed part types: `packages/database/prisma/seed.ts` — códigos `PRESIDENTE`, `ORACAO_*`, `LEITURA_BIBLIA`, `ESTUDO_BIBLICO`, topics `MINISTRY`, `CHRISTIAN_LIFE`
- Tests: `apps/api/src/schedule/assign-rules.spec.ts`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/assign-rules.ts` | editar |
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/api/src/schedule/assign-rules.spec.ts` | editar |
| `packages/database/prisma/recalc-counters.ts` ou migration SQL | criar |

---

## 2.1 — `resolveCountCategory()`

### O que fazer

Em `assign-rules.ts`:

```typescript
export type AssignmentCountCategory =
  | 'presidente' | 'oracao' | 'titular' | 'dirigente' | 'ajudante' | 'ministerio';

export function resolveCountCategory(input: {
  partTypeCode: string;
  partTopic: PartTopic;
  role: AssignmentRole;
  participantSex: Sex;
}): AssignmentCountCategory | null
```

Lógica (ver `design.md` D1):

- `PRESIDENTE` → `presidente`
- `ORACAO_INICIAL` / `ORACAO_FINAL` → `oracao`
- `ESTUDO_BIBLICO` + `LEITOR` → `titular`
- `ESTUDO_BIBLICO` + `DIRIGENTE` → `dirigente`
- `LEITURA_BIBLIA` + male → `ministerio`; female → `null` ou skip
- `topic === MINISTRY` + male → `ministerio` para TITULAR/AJUDANTE (ajudante→`ajudante`, titular→`ministerio`)
- `topic === CHRISTIAN_LIFE` (custom) → `titular` para TITULAR
- Default TITULAR → `titular`
- AJUDANTE → `ajudante`

```typescript
export function counterFieldForCategory(
  category: AssignmentCountCategory,
): keyof Pick<Participant, 'presidenteCount' | 'oracaoCount' | ...>
```

### Critérios de aceite

- [ ] Tabela de casos coberta em unit tests
- [ ] Leitor do livro → titular, não leitorCount

---

## 2.2 — Refatorar increment/decrement

### O que fazer

Substituir uso direto de `counterKeyForRole` em `incrementCounters`/`decrementCounters`:

```typescript
const category = resolveCountCategory({ partTypeCode, partTopic, role, participantSex });
if (!category) return;
const field = counterFieldForCategory(category);
// increment field, floor at 0 on decrement
```

Passar `partType.code`, `partType.topic`, `role`, e sex do participante nos métodos.

Remover incremento duplo de `ministryPracticeCount` / `leitorCount` no novo modelo.

### Critérios de aceite

- [ ] assign/unassign em testes existentes passam ou são atualizados
- [ ] Novo assign incrementa campo correto

---

## 2.3 — Recálculo histórico

### O que fazer

Script idempotente `packages/database/prisma/recalc-counters.ts`:

1. `UPDATE Participant SET` zerar todos contadores
2. `findMany` AssignmentSlot where participantId not null, include weekPart.partType, participant.sex
3. Para cada slot, `resolveCountCategory` + increment em memória ou batch update
4. Invocar no final da migration ou como comando `npm run recalc-counters`

### Critérios de aceite

- [ ] Script roda 2x sem drift
- [ ] Contagens batem com expectativa em fixture de teste

---

## 2.4 — Unit tests

### O que fazer

Casos mínimos em `assign-rules.spec.ts`:

| Parte | Role | Sex | Categoria |
|-------|------|-----|-----------|
| PRESIDENTE | TITULAR | MALE | presidente |
| ORACAO_INICIAL | TITULAR | MALE | oracao |
| ESTUDO_BIBLICO | LEITOR | MALE | titular |
| ESTUDO_BIBLICO | DIRIGENTE | MALE | dirigente |
| LEITURA_BIBLIA | TITULAR | MALE | ministerio |
| FSM_INICIANDO | TITULAR | MALE | ministerio |
| FSM_INICIANDO | TITULAR | FEMALE | null ou ajudante/titular per design — **female FSM titular: não ministerio** (spec: não incrementa ministério) |
| FSM | AJUDANTE | FEMALE | ajudante |
| NVC custom | TITULAR | MALE | titular |

### Critérios de aceite

- [ ] Todos os casos passam

### Não fazer

- Não alterar picker UI nesta task

---

## Verificação do grupo

```bash
cd apps/api && npm test -- assign-rules
node packages/database/prisma/recalc-counters.ts  # ou via migration
```

## Handoff

Contadores consistentes com nova taxonomia. Task 4 pode agregar por categoria.
