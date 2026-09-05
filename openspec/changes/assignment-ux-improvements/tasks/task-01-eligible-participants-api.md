# Task 1 — Eligible participants API

**Change:** `assignment-ux-improvements`  
**Grupo:** 1 de 4  
**Pré-requisitos:** change `midweek-assignment-system` (task 8) já implementada  
**Desbloqueia:** [task-02](./task-02-part-title-and-suggest-api.md), [task-03](./task-03-participant-picker-component.md)

## Objetivo do grupo

Entregar `GET /slots/:id/eligible-participants` com listas `eligible` e `ineligibleVisible`, reutilizando a mesma lógica de elegibilidade de `suggestForPart` e `assignSlot`.

## Contexto para o subagent

- Motor de regras: `apps/api/src/schedule/assign-rules.ts` — `validateHardAssignRules`, `hardRejectMessage`
- Ausências: `apps/api/src/absences/eligibility.ts` — `isEligibleGivenAbsences`
- Service atual: `apps/api/src/schedule/schedule.service.ts` — `suggestForPart` (linhas ~393–458) já itera todos os participantes
- Controller: `apps/api/src/schedule/schedule.controller.ts`
- Mensagens pt-BR já existem em `hardRejectMessage`

**Regras de visibilidade (decisão do usuário):**

| reasonCode | Na resposta |
|---|---|
| `SEX_NOT_ALLOWED` | omitir |
| `PRIVILEGE_NOT_ALLOWED` | omitir |
| `ROLE_PREFERENCE` | omitir |
| `ABSENCE` | `ineligibleVisible` |
| `FEMALE_WEEK_LIMIT` | `ineligibleVisible` |

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/api/src/schedule/schedule.controller.ts` | editar |
| `apps/api/src/schedule/schedule.service.spec.ts` ou `assign-rules.spec.ts` | editar/criar testes |

---

## 1.1 — Extrair builder de elegibilidade compartilhado

### O que fazer

Em `schedule.service.ts`, extrair método privado reutilizável, por exemplo:

```typescript
private async buildParticipantEligibilityForSlot(
  slot: SlotWithContext,
): Promise<{
  eligible: EligibleParticipantView[];
  ineligibleVisible: IneligibleVisibleView[];
}>
```

Lógica (espelhar `suggestForPart`):

1. Carregar todos os participantes com `absences`
2. Para cada participante, chamar `validateHardAssignRules` com `partType`, `role`, `femaleAssignmentCountInWeek`
3. Se hard reject:
   - Se código ∈ `{ SEX_NOT_ALLOWED, PRIVILEGE_NOT_ALLOWED, ROLE_PREFERENCE }` → **skip** (não incluir)
   - Se `FEMALE_WEEK_LIMIT` → `ineligibleVisible`
4. Se hard pass mas `!isEligibleGivenAbsences` → `ineligibleVisible` com `ABSENCE`
5. Se elegível → `eligible` com `id`, `name`, `sex`, `privilege`, `counter` (usar `counterKeyForRole` existente)

Refatorar `suggestForPart` para usar este método e pegar `eligible[0]` após `sortSuggestionCandidates`.

### Critérios de aceite

- [ ] `suggestForPart` comportamento inalterado (mesmos testes passam)
- [ ] Lógica de elegibilidade em um único lugar no service

### Não fazer

- Não duplicar regras no frontend
- Não alterar `assign-rules.ts` sem necessidade

---

## 1.2 — Endpoint GET /slots/:id/eligible-participants

### O que fazer

**Controller** (`schedule.controller.ts`):

```typescript
@Get('slots/:id/eligible-participants')
eligibleParticipants(@Param('id') id: string) {
  return this.scheduleService.getEligibleParticipants(id);
}
```

**Service** — `getEligibleParticipants(slotId)`:

- Reutilizar `loadSlotContext(slotId)` (já usado em assign)
- Chamar `buildParticipantEligibilityForSlot`
- Ordenar `eligible` por nome (locale pt) para UX consistente
- Retornar:

```json
{
  "slotId": "uuid",
  "role": "TITULAR",
  "eligible": [
    {
      "id": "uuid",
      "name": "João Silva",
      "sex": "MALE",
      "privilege": "ELDER",
      "counter": 2
    }
  ],
  "ineligibleVisible": [
    {
      "id": "uuid",
      "name": "Maria Santos",
      "reasonCode": "ABSENCE",
      "reason": "Participante ausente na data da reunião"
    }
  ]
}
```

Usar `hardRejectMessage` para textos de `reason`.

### Critérios de aceite

- [ ] Endpoint protegido por auth (mesmo guard das outras rotas schedule)
- [ ] Slot inexistente → 404
- [ ] Homem publicador não aparece em lista de Tesouros (nem eligible nem ineligibleVisible)
- [ ] Mulher já designada na semana aparece em `ineligibleVisible` com `FEMALE_WEEK_LIMIT`
- [ ] Ausente na `meetingDate` aparece em `ineligibleVisible` com `ABSENCE`

### Não fazer

- Não incluir participantes com sexo/privilégio/preferência incompatível em nenhuma lista

---

## 1.3 — Testes de visibilidade

### O que fazer

Adicionar testes unitários cobrindo:

1. Participante com sexo errado → ausente da resposta
2. Participante com privilégio errado → ausente
3. Participante com preferência incompatível → ausente
4. Ausente → `ineligibleVisible` com `ABSENCE`
5. Mulher com designação na semana → `ineligibleVisible` com `FEMALE_WEEK_LIMIT`
6. Elegível → `eligible` com counter correto

Preferir testes no service com mocks Prisma ou extrair função pura testável.

### Critérios de aceite

- [ ] `pnpm --filter api test` passa
- [ ] Pelo menos 4 cenários de visibilidade cobertos

### Não fazer

- Não testar UI nesta task

---

## Verificação do grupo

```bash
# Com API rodando e autenticado:
curl -s -b cookies.txt "http://localhost:3001/slots/<SLOT_ID>/eligible-participants" | jq
```

Confirmar estrutura JSON e que participantes inelegíveis por sexo não aparecem.

## Handoff para próxima task

- Endpoint estável em `GET /slots/:id/eligible-participants`
- `buildParticipantEligibilityForSlot` pronto para `excludeParticipantId` na task 2
