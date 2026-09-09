## Context

Changes anteriores entregaram o motor (`midweek-assignment-system`) e UX do picker (`assignment-ux-improvements`). Estado atual relevante:

- Contadores em `Participant`: `titularCount`, `ajudanteCount`, `dirigenteCount`, `leitorCount`, `ministryPracticeCount`
- Mapeamento role→counter em `assign-rules.ts` `counterKeyForRole()`
- Elegibilidade estática via `PartType.privileges` no seed
- Picker: um número (`counter`) + ordem alfabética (`getEligibleParticipants`)
- Alerta `REPEAT_MONTH` via `AlertConfig` por privilégio; banner de confirmação no **topo** da página da semana
- `FEMALE_WEEK_LIMIT`: bloqueio rígido 1 parte/semana
- Telefone em `Participant.phone` (opcional), não usado na semana
- Semana: `/schedule/[yearMonth]/weeks/[weekId]` — sem prev/next

Decisões do usuário (explore + follow-up):

1. Manter 1 parte/semana para mulheres; alerta + confirmação na 2ª+ do mês (sempre, qualquer privilégio)
2. `qualified` só para Batizado; elegível em oração/leitor se qualificado
3. Recalcular histórico
4. Tabela compacta Este mês / Total; colunas > 0; categoria da designação à esquerda
5. WhatsApp na view da semana (Sugerir/Limpar); normalizar `wa.me`
6. Navegação só dentro do mês; última semana sem próximo; swipe só touch
7. Ordem colunas: [Relevante] → Titular → Dirigente → Ajudante → Presidente → Ministério → Oração

## Goals / Non-Goals

**Goals:**

- Contadores alinhados à prática congregacional
- Picker informativo e ordenado por equilíbrio
- Corrigir UX de confirmação (inline no slot)
- Qualificado + defaults de cadastro
- WhatsApp e navegação semanal

**Non-Goals:**

- Cruzar fronteira de mês na navegação
- Swipe com mouse
- Reescrever catálogo de partes

## Decisions

### D1 — Taxonomia de contagem (`AssignmentCountCategory`)

Nova enum interna (API + shared):

```typescript
type AssignmentCountCategory =
  | 'presidente'
  | 'oracao'
  | 'titular'
  | 'dirigente'
  | 'ajudante'
  | 'ministerio';
```

Função `resolveCountCategory(input)` em `assign-rules.ts`:

| Condição | Categoria |
|----------|-----------|
| `partType.code === 'PRESIDENTE'` | `presidente` |
| `partType.code` ∈ `ORACAO_INICIAL`, `ORACAO_FINAL` | `oracao` |
| `partType.code === 'ESTUDO_BIBLICO'` + `role === LEITOR` | `titular` |
| `partType.code === 'ESTUDO_BIBLICO'` + `role === DIRIGENTE` | `dirigente` |
| `role === AJUDANTE` | `ajudante` |
| `partType.code === 'LEITURA_BIBLIA'` | `ministerio` (só `MALE`) |
| `partType.topic === MINISTRY` | `ministerio` (só `MALE`) |
| `partType.topic === CHRISTIAN_LIFE` (custom NVC) | `titular` |
| `role === TITULAR` em Tesouros/Joias/NVC system | `titular` |
| Demais `TITULAR` default | `titular` |

Mulheres: `ministerio` nunca incrementa (atribuições FSM femininas não entram em Ministério).

### D2 — Campos de contador no schema

Adicionar em `Participant`:

```prisma
qualified       Boolean @default(false)
presidenteCount Int     @default(0)
oracaoCount     Int     @default(0)
ministerioCount Int     @default(0)
```

Manter `titularCount`, `ajudanteCount`, `dirigenteCount`. Deprecar uso de `leitorCount` e `ministryPracticeCount` (migration copia `ministryPracticeCount` → `ministerioCount` onde aplicável, depois zera `leitorCount`).

`incrementCounters` / `decrementCounters` usam `resolveCountCategory` em vez de `counterKeyForRole` direto.

### D3 — Recálculo histórico

Script em migration ou `prisma/seed-recalc-counters.ts` idempotente:

1. Zerar todos os contadores novos + titular/ajudante/dirigente/ministerio
2. Iterar `AssignmentSlot` com `participant`, `role`, `weekPart.partType`
3. Aplicar `resolveCountCategory` e incrementar campo correspondente
4. Rodar em migration SQL ou script Node pós-deploy

### D4 — Elegibilidade com qualificado

Em `validateHardAssignRules` (ou helper `isPrivilegeEligible`):

- Oração inicial/final, leitor do livro (`ESTUDO_BIBLICO` + `LEITOR`):
  - `ELDER`, `MINISTERIAL_SERVANT` → OK
  - `BAPTIZED` + `qualified === true` → OK
  - Demais → `PRIVILEGE_NOT_ALLOWED`
- Dirigente do livro: apenas `ELDER`, `MINISTERIAL_SERVANT` (sem batizado qualificado)

Atualizar seed: `ORACAO_*` privileges = `[ELDER, MINISTERIAL_SERVANT, BAPTIZED]`; validação runtime exige `qualified` para batizado.

### D5 — Endpoint enriched `GET /slots/:id/eligible-participants`

Resposta ampliada por participante elegível:

```json
{
  "slotId": "...",
  "role": "LEITOR",
  "sortCategory": "titular",
  "eligible": [{
    "id": "...",
    "name": "Wilson",
    "privilege": "MINISTERIAL_SERVANT",
    "phone": "11999999999",
    "assignedThisWeek": false,
    "countsThisMonth": { "titular": 2, "oracao": 1 },
    "countsTotal": { "titular": 15, "oracao": 8 }
  }],
  "ineligibleVisible": []
}
```

- `counts*` omitem chaves com valor 0
- `sortCategory`: categoria usada para ordenação deste slot
- Ordenação:
  1. `assignedThisWeek === false` antes de `true`
  2. `countsThisMonth[sortCategory]` asc (0 se ausente)
  3. `countsTotal[sortCategory]` asc
  4. `name` pt-BR

`assignedThisWeek`: existe outro slot na mesma `weekId` com esse `participantId`.

### D6 — Colunas do picker (UI)

Layout por participante:

```
| Quando   | [sortCategory] | Titular | Dirigente | Ajudante | Presidente | Ministério | Oração |
| Este mês |       2        |    1    |     —     |    —     |     —      |     —      |   —    |
| Total    |      15        |   12    |     3     |    —     |     2      |     1      |   8    |
```

- Coluna `Quando` fixa à esquerda
- Ordem de colunas de contagem: `sortCategory` primeiro (se > 0 em alguma linha), depois Titular → Dirigente → Ajudante → Presidente → Ministério → Oração
- Ocultar coluna se valor 0 em **ambas** as linhas
- Labels pt-BR: Presidente, Oração, Titular, Dirigente, Ajudante, Ministério

### D7 — Alerta feminino no mês + confirmação inline

Novo soft alert `FEMALE_REPEAT_MONTH`:

- Dispara quando `sex === FEMALE` e já tem ≥1 designação no mesmo `monthId` (excluindo slot atual)
- **Independente** de `AlertConfig`
- Mensagem pt-BR explícita: participante feminina já designada neste mês

UI: mover confirmação para **dentro do card do slot** (`pendingConfirm.slotId === slot.id`), não só no topo da página. Ao selecionar participante com alertas, manter nome visível no picker até confirmar ou cancelar.

### D8 — WhatsApp

Helper `buildWhatsAppUrl(phone, message)` em `apps/web/src/lib/whatsapp.ts`:

- Normalizar: dígitos only; se não começa com `55` e length 10–11, prefixar `55`
- URL: `https://wa.me/${digits}?text=${encodeURIComponent(message)}`

Mensagem template (formatação WhatsApp `*bold*` / `_italic_`):

```
Sua designação — Reunião do meio de semana

📅 *{data reunião}*
📋 *{título da parte}*
{linhas de papéis conforme slot clicado}
```

- Botão ao lado de Sugerir/Limpar por slot designado
- `window.open(url, '_blank')`

### D9 — Navegação semanal (dentro do mês)

Client-side a partir de `month.weeks` (já carregado ou `ensureMonth`):

```typescript
function adjacentWeeks(weeks: WeekView[], weekId: string) {
  const i = weeks.findIndex(w => w.id === weekId);
  return {
    prev: i > 0 ? weeks[i - 1] : null,
    next: i < weeks.length - 1 ? weeks[i + 1] : null,
  };
}
```

Rodapé ao final do conteúdo da semana:

- `← Semana anterior` (link) se `prev`
- `Próxima semana →` (link) se `next`
- Na última semana: sem botão próximo e **sem** swipe para frente

Swipe touch (`pointer: coarse` ou detecção touch):

- `touchstart` / `touchend` na área principal; threshold ~60px horizontal
- Swipe esquerda → próxima; direita → anterior
- Desabilitar quando `ParticipantPicker` aberto (prop `onOpenChange` ou callback)
- `router.push` para `/schedule/${yearMonth}/weeks/${id}`

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Recálculo incorreto em histórico grande | Testes unitários `resolveCountCategory`; spot-check manual |
| Picker pesado (N participantes × histórico) | Agregar contagens em query SQL agrupada por participante/mês |
| Swipe conflita com scroll | Threshold horizontal; ignorar se Δy > Δx |
| Telefones mal formatados | Normalização conservadora + log dev |

## Migration

1. Prisma migration: `qualified`, `presidenteCount`, `oracaoCount`, `ministerioCount`
2. Script recálculo contadores
3. Deploy API + web juntos (contrato enriched do endpoint)
