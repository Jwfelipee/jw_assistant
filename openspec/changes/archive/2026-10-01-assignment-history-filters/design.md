## Context

- Endpoint: `GET /assignments/history` — `HistoryQueryDto` + `schedule.service.history` (`apps/api/src/schedule/`)
- UI: `apps/web/src/components/assignment-history-view.tsx` — filtros `q`, `from`, `to`, `topic`, `role`
- Cada slot referencia `weekPart.partType` (label, code, topic) e `participant.sex`
- Catálogo: `GET /catalog/part-types` — lista tipos seed + NVC/FSM criados pela congregação

Decisões do produto (confirmadas):

1. Com período preenchido, “última por participante” = slot mais recente **cujo `meetingDate` está no intervalo** (respeitando também sexo, designação, papel).
2. Ordenação global da lista: **`meetingDate` desc** (inalterada).
3. Estudo bíblico: papéis **Dirigente**, **Leitor** e **Dirigente e leitor** (inclui registros com `role` DIRIGENTE **ou** LEITOR no tipo Estudo).
4. Dropdown: **cada `PartType`** + **“Todas as designações”**.
5. Toggle “última por participante” **independente** da designação (pode usar só sexo + período, etc.).

## Goals / Non-Goals

**Goals:**

- Filtros server-side (fonte única) com paginação correta nos dois modos (lista flat vs última por participante)
- UI mobile-first alinhada ao formulário atual
- Compatibilidade: params antigos `topic` e `role` continuam válidos para clientes que ainda os enviem

**Non-Goals:**

- Mudar modelo de contadores ou elegibilidade
- Novo endpoint separado (estender o existente)

## Decisions

### D1 — Query params

| Param | Tipo | Descrição |
|-------|------|-----------|
| `sex` | `MALE` \| `FEMALE` | opcional; filtra `participant.sex` |
| `partTypeId` | uuid | opcional; filtra `weekPart.partTypeId` |
| `studyRole` | `DIRIGENTE` \| `LEITOR` \| `BOTH` | opcional; só relevante quando `partType` é Estudo bíblico (`code` `ESTUDO_BIBLICO`) ou quando UI envia após escolher estudo |
| `lastPerParticipant` | boolean | default `false` |
| `topic`, `role`, `q`, `from`, `to`, `participantId`, `page`, `limit` | existentes | inalterados semanticamente |

**`studyRole`:**

- `DIRIGENTE` → `role = DIRIGENTE`
- `LEITOR` → `role = LEITOR`
- `BOTH` → `role IN (DIRIGENTE, LEITOR)`
- Omitido + `partTypeId` estudo → todos os papéis do estudo (equivalente a BOTH para fins de resultado)

**`role` legado:** se `studyRole` e `role` vierem juntos, **`studyRole` prevalece** quando `partTypeId` aponta para Estudo bíblico; caso contrário usar `role` como hoje.

### D2 — Modo `lastPerParticipant`

```
Filtros base (sex, partType, topic, role/studyRole, q, from, to)
        │
        ▼
Conjunto S de slots com participantId não nulo
        │
        ├─ lastPerParticipant = false → ORDER BY meetingDate DESC, paginar (atual)
        │
        └─ lastPerParticipant = true
              → DISTINCT ON (participant_id) ORDER BY participant_id, meetingDate DESC
              → reordenar resultado por meetingDate DESC (para UI)
              → total = count distinct participants matching filters
```

Implementação Postgres (via Prisma `$queryRaw` ou subquery tipada):

- Join `AssignmentSlot` → `WeekPart` → `Week` → `Month`, `PartType`, `Participant`
- `WHERE` espelha o `where` Prisma atual
- `DISTINCT ON ("participantId")` com `ORDER BY "participantId", w."meetingDate" DESC`
- Paginação: `LIMIT`/`OFFSET` **após** distinct, na ordenação por data desc

**Sem período:** intervalo de datas não restringe quais slots entram no distinct — a “última” é global entre os que passam nos outros filtros.

**Com período:** apenas slots com `meetingDate` em `[from, to]` entram em S; distinct escolhe o mais recente **dentro de S**.

### D3 — UI do formulário

Substituir select de **Tópico** por **Designação**:

- Carregar `listPartTypes()` ao montar (ou cache session)
- `<optgroup>` por `TOPIC_LABELS` + opção `value=""` → “Todas as designações”
- Manter **Papel** para FSM (Titular/Ajudante) quando designação tiver `slotMode === TWO` e não for estudo

**Estudo bíblico** (quando `partType.code === 'ESTUDO_BIBLICO'` ou id selecionado):

- Substituir/expandir papel: **Todos os papéis** | **Dirigente** | **Leitor** | **Dirigente e leitor** → mapeia para `studyRole` omitido / `DIRIGENTE` / `LEITOR` / `BOTH`

**Sexo:** select Todos | Homens | Mulheres

**Checkbox:** “Apenas a última designação de cada participante” → `lastPerParticipant=true`

Remover envio de `topic` na UI nova (designação substitui); API mantém `topic` para compat.

### D4 — Resposta

Mesmo shape `HistoryItem` / `HistoryResult`. Opcional: incluir `participantSex` no item (útil na lista) — **nice-to-have**; incluir se custo baixo no map existente.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| `DISTINCT ON` + paginação incorreta | Testes de integração com 3+ slots mesmo participante |
| Query raw vs Prisma drift | Centralizar construção de filtros em helper compartilhado |
| Dropdown grande (muitos tipos FSM) | optgroup + ordem `defaultSortOrder` do catálogo |

## Open Questions

- Nenhuma bloqueante — decisões de produto fechadas na exploração.
