# Task 1 — History API filters

**Change:** `assignment-history-filters`  
**Grupo:** 1 de 4  
**Pré-requisitos:** `midweek-assignment-system` (histórico base) implementado  
**Desbloqueia:** [task-02](./task-02-history-api-tests.md), [task-03](./task-03-history-filters-ui.md)

## Objetivo do grupo

Estender `GET /assignments/history` com filtros por sexo, tipo de parte (designação), papéis do Estudo bíblico e modo agregado “última por participante”, mantendo ordenação por `meetingDate` desc.

## Contexto para o subagent

- Controller: `apps/api/src/schedule/schedule.controller.ts` — `@Get('assignments/history')`
- DTO: `apps/api/src/schedule/dto/history-query.dto.ts`
- Service: `apps/api/src/schedule/schedule.service.ts` — método `history` (~linha 767)
- Web client: `apps/web/src/lib/schedule.ts` — `HistoryQuery`, `fetchAssignmentHistory`
- Enums: `Sex`, `AssignmentRole`, `PartTopic` em `@jw/shared`
- Estudo bíblico seed: `partType.code === 'ESTUDO_BIBLICO'`

**Não alterar:** aba Por mês, motor de assign, contadores.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/dto/history-query.dto.ts` | editar |
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/web/src/lib/schedule.ts` | editar |

---

## 1.1 — Extend HistoryQueryDto

### O que fazer

Adicionar campos opcionais:

```typescript
@IsOptional()
@IsEnum(Sex)
sex?: Sex;

@IsOptional()
@IsString()
partTypeId?: string;

@IsOptional()
@IsEnum(StudyHistoryRole) // criar enum local no dto ou em shared: DIRIGENTE | LEITOR | BOTH
studyRole?: StudyHistoryRole;

@IsOptional()
@Transform(({ value }) => value === true || value === 'true')
@IsBoolean()
lastPerParticipant?: boolean;
```

Usar `class-transformer` para `lastPerParticipant` vindo de query string.

### Critérios de aceite

- [x] Validação rejeita valores inválidos com 400
- [x] Params antigos continuam aceitos

### Não fazer

- Não remover `topic` nem `role` do DTO

---

## 1.2 — Filtros no ramo flat (comportamento atual)

### O que fazer

No `where` Prisma de `history`:

- `sex` → `participant: { sex: query.sex }` (combinar com filtro de nome existente)
- `partTypeId` → `weekPart: { partTypeId: query.partTypeId, ... }`
- `studyRole`:
  - `DIRIGENTE` → `role: DIRIGENTE`
  - `LEITOR` → `role: LEITOR`
  - `BOTH` → `role: { in: [DIRIGENTE, LEITOR] }`
- Se `studyRole` omitido, manter `query.role` como hoje

Aplicar `from`/`to` em `week.meetingDate` como já existe.

### Critérios de aceite

- [x] Filtros combinam com AND
- [x] Slots sem participante continuam excluídos (`participantId: { not: null }`)

---

## 1.3 — Ramo lastPerParticipant

### O que fazer

Quando `query.lastPerParticipant === true`:

1. Construir o mesmo conjunto filtrado S (participantId not null).
2. Obter **uma linha por `participantId`**: slot de maior `meetingDate` em S.
3. `total` = número de participantes distintos em S (não contagem de slots).
4. Ordenar resultado final por `meetingDate` **desc** antes de `skip`/`take`.
5. Mapear para o mesmo shape `items` que o ramo flat.

Implementação sugerida (Postgres):

- Extrair helper `buildHistoryWhere(query): Prisma.AssignmentSlotWhereInput`
- Para agregação: `$queryRaw` com joins explícitos **ou** subquery:
  - inner: ids dos slots vencedores por participante
  - outer: `findMany({ where: { id: { in: winnerIds } }, orderBy: meetingDate desc })`

Garantir que **com** `from`/`to`, S já está restrito ao período antes do distinct.

### Critérios de aceite

- [x] Dois slots Joias do mesmo irmão no período → uma linha (data mais recente no período)
- [x] Paginação `page`/`limit` aplica-se ao conjunto agregado
- [x] Ordenação por data desc igual ao modo flat

### Não fazer

- Não carregar todos os slots em memória para congregações grandes sem necessidade

---

## 1.4 — Client HistoryQuery

### O que fazer

Em `apps/web/src/lib/schedule.ts`:

```typescript
export type StudyHistoryRole = 'DIRIGENTE' | 'LEITOR' | 'BOTH';

export type HistoryQuery = {
  // ...existentes
  sex?: Sex;
  partTypeId?: string;
  studyRole?: StudyHistoryRole;
  lastPerParticipant?: boolean;
};
```

Atualizar `fetchAssignmentHistory` para serializar os novos params (`lastPerParticipant=true`, etc.).

### Critérios de aceite

- [x] Query string correta para todos os novos campos

---

## Verificação do grupo

```bash
# Exemplo manual (com sessão autenticada)
curl -s "http://localhost:3001/assignments/history?sex=FEMALE&partTypeId=<uuid-joias>&lastPerParticipant=true&from=2025-01-01&to=2025-12-31"
```

## Handoff para próxima task

DTO e service prontos; task-02 adiciona testes automatizados; task-03 consome os novos campos na UI.
