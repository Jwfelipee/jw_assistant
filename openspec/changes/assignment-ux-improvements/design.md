## Context

A change `midweek-assignment-system` entregou o motor de designação e a UI básica da semana (`apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx`). O fluxo atual:

1. Carrega **todos** os participantes via `GET /api/participants`
2. `<select>` nativo por slot
3. Usuário clica **Designar** → `PUT /slots/:id/assign`
4. Erros hard só aparecem após o clique

A lógica de elegibilidade já existe em `apps/api/src/schedule/assign-rules.ts` e é usada em `assignSlot` e `suggestForPart`. Congregação típica: **70+ participantes**.

## Goals / Non-Goals

**Goals:**

- Reduzir cliques: selecionar = designar
- Sugerir já designa; permitir trocar participante ou pedir outra sugestão
- Picker mostra só opções relevantes; busca por nome
- Editar tema de partes existentes inline
- Endpoint dedicado de elegibilidade (fonte única de verdade no servidor)

**Non-Goals:**

- Mudar regras de negócio
- Adicionar shadcn/ui ou libs pesadas de combobox
- Cache complexo de elegibilidade entre slots
- Mostrar motivo de inelegibilidade para sexo/privilégio/preferência

## Decisions

### D1 — Endpoint `GET /slots/:id/eligible-participants`

Retorna duas listas:

```json
{
  "eligible": [
    { "id": "...", "name": "João Silva", "sex": "MALE", "privilege": "ELDER", "counter": 3 }
  ],
  "ineligibleVisible": [
    {
      "id": "...",
      "name": "Maria Santos",
      "reasonCode": "ABSENCE",
      "reason": "Participante ausente na data da reunião"
    }
  ]
}
```

**Categorização de inelegibilidade:**

| `reasonCode` | Visibilidade no picker |
|---|---|
| `SEX_NOT_ALLOWED` | **Oculto** — não retornado |
| `PRIVILEGE_NOT_ALLOWED` | **Oculto** |
| `ROLE_PREFERENCE` | **Oculto** |
| `ABSENCE` | Visível ao final, cinza, não selecionável |
| `FEMALE_WEEK_LIMIT` | Visível ao final, cinza, não selecionável |

Implementação: extrair loop de elegibilidade de `suggestForPart` para método privado `buildEligibilityLists(slotId)` reutilizado por suggest, eligible e assign.

**Alternatives:** filtro client-side com regras em `@jw/shared` — rejeitado por duplicar lógica e não ter ausências no payload atual.

### D2 — Auto-assign na seleção

`ParticipantPicker.onSelect(participantId)` chama `assignSlot(id, participantId, false)` imediatamente.

- Se `requiresConfirmation`: exibir painel de alertas existente (sem mudança de comportamento)
- Seleção vazia / limpar: **não** desfaz designação — manter botão **Limpar**
- Durante request: desabilitar picker, mostrar "Salvando…"
- Remover botão **Designar**

### D3 — Sugerir designa e permite nova sugestão

Fluxo do botão **Sugerir**:

1. `GET /parts/:partId/suggest?role=X&excludeParticipantId=Y` (Y = participante atual do slot, se houver)
2. Se `suggestion` não nulo → `assignSlot` imediatamente
3. Clicar **Sugerir** novamente exclui o atual e retorna o próximo candidato elegível

Adicionar query opcional `excludeParticipantId` ao endpoint suggest existente; reutilizar mesma lista de elegíveis.

**Alternatives:** suggest retorna lista completa — rejeitado por payload desnecessário com 70+ participantes.

### D4 — `ParticipantPicker` (combobox custom)

Novo componente em `apps/web/src/components/participant-picker.tsx`:

- Input de busca com lista dropdown
- Carrega elegíveis ao focar/abrir (`GET /slots/:id/eligible-participants`)
- Filtra localmente por substring do nome (case-insensitive)
- Seção inferior: `ineligibleVisible` em cinza com `reason`
- Acessibilidade: `role="combobox"`, `aria-expanded`, navegação ↑↓ Enter Escape
- Mobile-first: touch targets ≥ 44px, lista scrollável

Sem dependências novas — React + Tailwind apenas.

### D5 — Edição inline de tema

`PATCH /schedule/parts/:partId` com body `{ title: string }` (max 300 chars).

UI na week page:

- Se `title` customizado ou usuário clica ✎: mostra input inline
- Salvar on blur ou botão Salvar (mobile)
- Placeholder "Adicionar tema…" quando `title === partTypeLabel`
- Partes de sistema sem tema: ok deixar vazio ou igual ao label

**Alternatives:** modal — rejeitado por fricção extra em mobile.

### D6 — Contador no picker

Incluir contador do papel relevante no item elegível (ex.: `titularCount` para TITULAR) — alinhado ao que suggest já expõe. Ajuda na escolha manual.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Request por slot ao abrir picker (N slots) | Lazy load só ao focar; cache em memória por slot na sessão da página |
| Seleção acidental designa | Confirmação para soft alerts; Limpar para desfazer |
| Combobox custom sem lib | Testar manualmente mobile + teclado; manter escopo simples |

## Migration

Nenhuma migration de banco. Deploy API + web juntos (novo endpoint e componente).
