## Context

- Picker: `apps/web/src/components/participant-picker.tsx`
- API: `GET /slots/:id/eligible-participants` → `getEligibleParticipants`
- Histórico por pessoa: `GET /participants/:id/assignments` + `listParticipantAssignments()` em `apps/web/src/lib/participants.ts`
- Histórico global (referência de formato): `fetchAssignmentHistory`, `ROLE_LABELS`, `TOPIC_LABELS`, `formatDateBr`

Decisões do produto:

1. **Última designação:** global (qualquer parte), `meetingDate` mais recente.
2. **Filtro “última”:** compara `lastAssignment.role` com papel escolhido (Titular, Ajudante, Dirigente, Leitor, Qualquer).
3. **Mini-lista:** vertical; altura fixa para **3 linhas**; overflow `scroll` só na caixa.
4. **Não** expandir a altura do item da lista — caixa separada dentro do card.
5. **Filtros:** `Map<slotId, FilterState>` em memória no picker (ou estado no week page passado por prop). Trocar `slotId` → reset visual para vazio; voltar ao mesmo `slotId` → reaplica estado salvo; “Limpar filtros” zera estado desse slot.

## Goals / Non-Goals

**Goals:**

- Um batch SQL de últimas designações ao montar elegíveis (sem N+1)
- Mobile-first: filtros em 1–2 linhas ou painel recolhível; touch targets ≥ 44px
- Cache de assignments por `participantId` enquanto dropdown aberto

**Non-Goals:**

- Server-side filtering por sexo/privilégio (payload já traz campos; filtro client)
- Período na “última designação”

## Decisions

### D1 — Shape `lastAssignment`

```typescript
type LastAssignmentView = {
  meetingDate: string; // YYYY-MM-DD
  role: AssignmentRole;
  partTypeLabel: string;
  partTopic: PartTopic;
};
```

Em cada `EligibleParticipant`: `lastAssignment: LastAssignmentView | null` (null se nunca designado).

Cálculo: para todos os `participantId` elegíveis, subquery `DISTINCT ON (participant_id)` ordenado por `meetingDate DESC` (join slot → weekPart → week → partType). Reutilizar padrão de `historyLastPerParticipant` se existir helper.

Participantes sem histórico: `lastAssignment: null` — filtro “última foi Ajudante” os **exclui**.

### D2 — Filtros no cliente

```typescript
type PickerFilters = {
  sex: '' | Sex.MALE | Sex.FEMALE;
  privilege: '' | Privilege; // ou 'ALL'
  lastRole: '' | AssignmentRole; // '' = qualquer
};
```

Pipeline: `eligible` → filter sex → privilege → lastRole → filter name query.

UI no topo do dropdown (abaixo do combobox input ou integrado):

- Sexo: Todos | Homens | Mulheres
- Privilégio: Todos + enum labels (`PRIVILEGE_LABELS`)
- Última designação: Qualquer | Titular | Ajudante | Dirigente | Leitor

Botão **Limpar filtros** (só filtros, não o texto de busca — ou limpar ambos; **decisão:** limpar os três selects + opcionalmente manter busca por nome; documentar: limpar filtros dos três dropdowns, busca por nome independente).

### D3 — Estado por slot

```typescript
const filtersBySlotRef = useRef<Map<string, PickerFilters>>(new Map());
```

- `useEffect` quando `slotId` muda: ler map ou default vazio; não escrever no map até usuário mudar filtro
- Ao mudar filtro: `map.set(slotId, next)`
- Abrir picker mesmo slot de novo: ler do map

### D4 — Mini-histórico (assignment strip)

Componente `ParticipantAssignmentStrip`:

- Trigger: botão ícone/texto “Designações” com `aria-expanded`
- Ao abrir: `listParticipantAssignments(id)` se não em cache
- Container: `max-height` ≈ `3 * lineHeight` (ex. `4.5rem` ou `calc(3 * 1.35em)`), `overflow-y: auto`, `overscroll-behavior: contain`
- Cada linha: `formatDateBr(date) · ROLE_LABELS[role] · partTypeLabel` (truncate com ellipsis)
- `onClick` / `onPointerDown` no strip: `stopPropagation` para não assign
- Selecionar participante: clique na área principal do `EligibleOption` (nome + contadores), não no strip

### D5 — Limite de assignments

Usar endpoint existente; no cliente exibir todas com scroll interno. Opcional v1: fatiar primeiras 30 no client se lista enorme (documentar limite 50 no fetch se adicionar `?limit=50` depois).

## Risks

| Risco | Mitigação |
|-------|-----------|
| Dropdown muito alto | Strip só quando expandido; max-height lista principal mantido |
| Query pesada lastAssignment | Uma query batch por abertura do picker |
| Confusão assign vs expand | Áreas de hit target distintas, testes manuais mobile |
