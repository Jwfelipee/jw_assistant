# Task 2 — Part title and suggest API

**Change:** `assignment-ux-improvements`  
**Grupo:** 2 de 4  
**Pré-requisitos:** [task-01](./task-01-eligible-participants-api.md)  
**Desbloqueia:** [task-04](./task-04-week-schedule-ux-integration.md)

## Objetivo do grupo

Permitir editar tema de partes existentes via API e melhorar suggest para retornar o próximo candidato ao excluir o assignee atual.

## Contexto para o subagent

- `WeekPart.title` já existe no Prisma (`packages/database/prisma/schema.prisma`)
- Criação de parte já aceita `title` opcional: `AddWeekPartDto` em `apps/api/src/schedule/dto/add-week-part.dto.ts`
- Não existe PATCH de parte — só `DELETE /schedule/parts/:partId`
- Suggest atual: `GET /parts/:id/suggest?role=TITULAR` — sem exclusão

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/dto/update-week-part.dto.ts` | criar |
| `apps/api/src/schedule/schedule.controller.ts` | editar |
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/web/src/lib/schedule.ts` | editar (tipos + `updatePartTitle`) |

---

## 2.1 — PATCH /schedule/parts/:partId

### O que fazer

**DTO** (`update-week-part.dto.ts`):

```typescript
export class UpdateWeekPartDto {
  @IsString()
  @IsNotEmpty({ message: 'title é obrigatório' })
  @MaxLength(300, { message: 'title deve ter no máximo 300 caracteres' })
  title!: string;
}
```

**Controller:**

```typescript
@Patch('schedule/parts/:partId')
updatePart(@Param('partId') partId: string, @Body() dto: UpdateWeekPartDto) {
  return this.scheduleService.updateWeekPartTitle(partId, dto);
}
```

**Service** — `updateWeekPartTitle(partId, dto)`:

- Buscar `weekPart` com `partType`
- Se não existe → 404
- `title = dto.title.trim().slice(0, 300)`
- Atualizar e retornar view parcial:

```json
{
  "id": "uuid",
  "title": "Discurso sobre fé",
  "partTypeLabel": "Leitura da Bíblia"
}
```

Não permitir editar partes removidas; partes de estudo bíblico podem ter tema editado (texto livre).

### Critérios de aceite

- [ ] Title persistido no banco
- [ ] String vazia após trim → 400
- [ ] Parte inexistente → 404

### Não fazer

- Não alterar `partTypeId`, `sortOrder` ou slots neste endpoint

---

## 2.2 — excludeParticipantId no suggest

### O que fazer

Atualizar `suggest` no controller:

```typescript
@Get('parts/:id/suggest')
suggest(
  @Param('id') id: string,
  @Query('role', new ParseEnumPipe(AssignmentRole)) role: AssignmentRole,
  @Query('excludeParticipantId') excludeParticipantId?: string,
) {
  return this.scheduleService.suggestForPart(id, role, excludeParticipantId);
}
```

No service, após `buildParticipantEligibilityForSlot` / lista elegível:

- Filtrar `eligible` removendo `excludeParticipantId` se fornecido
- `sortSuggestionCandidates` no restante
- Retornar primeiro ou `null`

Atualizar assinatura de `suggestForPart(partId, role, excludeParticipantId?: string)`.

### Critérios de aceite

- [ ] Sem `excludeParticipantId` → comportamento idêntico ao atual
- [ ] Com exclusão → retorna próximo candidato elegível
- [ ] Se só o excluído era elegível → `suggestion: null`

### Não fazer

- Não auto-assign no backend (assign continua sendo responsabilidade da UI)

---

## 2.3 — Testes e client helper

### O que fazer

**API tests** (ou smoke manual documentado):

- PATCH title happy path
- Suggest com exclude retorna candidato diferente

**Web client** (`apps/web/src/lib/schedule.ts`):

```typescript
export async function updatePartTitle(
  partId: string,
  title: string,
): Promise<{ id: string; title: string; partTypeLabel: string }> { ... }
```

Atualizar `suggestForPart` para aceitar `excludeParticipantId?: string` na query string.

### Critérios de aceite

- [ ] `pnpm --filter api test` passa
- [ ] Helpers web compilam (`pnpm --filter web typecheck`)

### Não fazer

- Não alterar UI da semana nesta task

---

## Verificação do grupo

```bash
curl -X PATCH -H "Content-Type: application/json" -b cookies.txt \
  -d '{"title":"Novo tema"}' \
  "http://localhost:3001/schedule/parts/<PART_ID>"

curl -b cookies.txt \
  "http://localhost:3001/parts/<PART_ID>/suggest?role=TITULAR&excludeParticipantId=<CURRENT_ID>"
```

## Handoff para próxima task

- `updatePartTitle` e suggest com exclusão disponíveis no client
- Task 4 usará PATCH para tema inline e suggest+assign com exclude
