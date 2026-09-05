# Task 4 — Week schedule UX integration

**Change:** `assignment-ux-improvements`  
**Grupo:** 4 de 4  
**Pré-requisitos:** [task-01](./task-01-eligible-participants-api.md), [task-02](./task-02-part-title-and-suggest-api.md), [task-03](./task-03-participant-picker-component.md)  
**Desbloqueia:** (change completa)

## Objetivo do grupo

Integrar todas as melhorias na tela da semana: auto-assign, suggest com assign, picker com busca, edição de tema inline, remoção do botão Designar.

## Contexto para o subagent

- Arquivo principal: `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx`
- Fluxo assign existente: `applyAssign`, `pendingConfirm`, `onAssignClick`
- Estado `slotDrafts` pode ser simplificado — picker mostra valor do slot após reload
- `listParticipants()` global pode ser removido se não usado em outro lugar da página

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx` | editar |
| `apps/web/src/lib/schedule.ts` | editar (se faltar suggest exclude) |

---

## 4.1 — ParticipantPicker com auto-assign

### O que fazer

Substituir bloco do `<select>` (linhas ~397–416) por:

```tsx
<ParticipantPicker
  slotId={slot.id}
  value={slot.participantId}
  participantName={slot.participantName}
  disabled={busySlotId === slot.id}
  busy={busySlotId === slot.id}
  onSelect={(participantId) => void applyAssign(slot.id, participantId, false)}
/>
```

- Remover estado `slotDrafts` se não mais necessário
- Remover `listParticipants()` do load inicial se só servia ao select
- Manter painel `pendingConfirm` inalterado

### Critérios de aceite

- [ ] Selecionar participante designa sem botão extra
- [ ] Soft alerts ainda exigem confirmação
- [ ] Erros hard aparecem em `setError`
- [ ] Slot mostra nome do participante após sucesso

### Não fazer

- Não remover botão Limpar
- Não auto-unassign ao limpar picker

---

## 4.2 — Sugerir designa e re-sugerir

### O que fazer

Atualizar `onSuggest`:

```typescript
async function onSuggest(part: WeekPartView, role: AssignmentRole, slotId: string) {
  setBusySlotId(slotId);
  setError(null);
  try {
    const currentAssignee = part.slots.find(s => s.id === slotId)?.participantId;
    const result = await suggestForPart(part.id, role, currentAssignee ?? undefined);
    if (!result.suggestion) {
      setSuggestionNote("Nenhum participante elegível encontrado.");
      return;
    }
    await applyAssign(slotId, result.suggestion.id, false);
    setSuggestionNote(`Sugerido: ${result.suggestion.name}`);
  } catch (err) { ... }
  finally { setBusySlotId(null); }
}
```

- Clicar Sugerir com assignee atual → próximo candidato
- Após assign via suggest, usuário pode abrir picker e escolher outro

### Critérios de aceite

- [ ] Sugerir em slot vazio designa o top candidato
- [ ] Sugerir em slot ocupado designa próximo elegível
- [ ] Mensagem quando não há candidatos

### Não fazer

- Não loop automático de sugestões

---

## 4.3 — Remover Designar

### O que fazer

- Remover botão **Designar** e função `onAssignClick`
- Manter **Sugerir** e **Limpar**
- Revisar copy/aria-labels se mencionavam "designar" em dois passos
- `busySlotId` cobre feedback de "Salvando…" no picker

### Critérios de aceite

- [ ] Não existe botão Designar na UI
- [ ] Fluxo completo funciona: select → assign → confirm alerts → reload

### Não fazer

- Não alterar endpoints de assign/unassign

---

## 4.4 — Edição inline de tema

### O que fazer

Na seção do cabeçalho de cada parte (~linhas 364–372):

**Estado local:** `editingPartId: string | null`, `editTitle: string`

**Modo leitura:**
- Se `part.title !== part.partTypeLabel`: mostrar `Tema: {part.title}`
- Botão/ícone ✎ "Editar tema" (acessível, `aria-label`)
- Se igual ao label: link discreto "Adicionar tema…"

**Modo edição:**
- Input com `value={editTitle}`, maxLength 300
- Salvar on blur ou botão Salvar (preferir botão explícito no mobile)
- Chamar `updatePartTitle(part.id, editTitle)`
- Em sucesso: `load()` ou atualizar estado local
- Cancelar: Escape ou botão Cancelar

Tratar erro com mensagem inline.

### Critérios de aceite

- [ ] Tema de parte existente editável e persistido
- [ ] Tema aparece após salvar sem reload completo (otimista ou reload ok)
- [ ] Funciona em mobile

### Não fazer

- Não editar `partTypeLabel` — só `title`

---

## 4.5 — Smoke test end-to-end

### O que fazer

Fluxo manual (ou E2E se existir):

1. Login → abrir semana com slots abertos
2. Abrir picker → buscar nome → selecionar → verificar designação
3. Trigger soft alert (se dados seed permitirem) → confirmar
4. Editar tema de uma parte → salvar → verificar display
5. Sugerir → verificar assign → Sugerir novamente → outro participante
6. Limpar slot

### Critérios de aceite

- [ ] Todos os passos acima funcionam
- [ ] `pnpm --filter web typecheck` e `pnpm --filter web lint` passam
- [ ] Sem regressão em month view / history

### Não fazer

- Não alterar PDF export

---

## Verificação do grupo

```bash
pnpm --filter web typecheck
pnpm --filter web lint
# Manual: dev server → /schedule/YYYY-MM/weeks/:id
```

Gravar evidência opcional (screenshot) do novo picker e tema inline.

## Handoff

Change `assignment-ux-improvements` pronta para archive após review.
