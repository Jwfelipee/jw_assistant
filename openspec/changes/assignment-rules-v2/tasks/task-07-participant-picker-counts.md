# Task 7 — Participant picker counts

**Change:** `assignment-rules-v2`  
**Grupo:** 7 de 8  
**Pré-requisitos:** [task-04](./task-04-eligible-participants-api.md)  
**Desbloqueia:** [task-08](./task-08-week-view-whatsapp-navigation.md)

## Objetivo do grupo

Substituir contador único por tabela compacta Este mês / Total no `ParticipantPicker`.

## Contexto para o subagent

- Component: `apps/web/src/components/participant-picker.tsx`
- `EligibleOption` renderiza nome + badge + `{participant.counter}` (linha ~322)
- Response API: `sortCategory`, `countsThisMonth`, `countsTotal` (task 4)
- Referência visual: screenshot do usuário (número único à direita hoje)

Labels pt-BR:

```typescript
const CATEGORY_LABELS: Record<AssignmentCountCategory, string> = {
  titular: 'Titular',
  dirigente: 'Dirigente',
  ajudante: 'Ajudante',
  presidente: 'Presidente',
  ministerio: 'Ministério',
  oracao: 'Oração',
};
```

Ordem fixa de colunas (após sortCategory):

`titular`, `dirigente`, `ajudante`, `presidente`, `ministerio`, `oracao`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/participant-picker.tsx` | editar |
| `apps/web/src/lib/schedule.ts` | editar (labels helper opcional) |

---

## 7.1 — Tabela compacta

### O que fazer

Novo subcomponente `ParticipantCountTable`:

Props: `sortCategory`, `countsThisMonth`, `countsTotal`

1. Calcular colunas: união de keys com valor > 0 em month OU total
2. Ordenar colunas: `sortCategory` primeiro (se presente), depois ordem fixa acima
3. Renderizar:

```tsx
<table className="w-full text-xs">
  <thead>
    <tr>
      <th>Quando</th>
      {columns.map(c => <th key={c}>{CATEGORY_LABELS[c]}</th>)}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Este mês</td>
      {columns.map(c => <td key={c}>{countsThisMonth[c] ?? 0}</td>)}
    </tr>
    <tr>
      <td>Total</td>
      {columns.map(c => <td key={c}>{countsTotal[c] ?? 0}</td>)}
    </tr>
  </tbody>
</table>
```

Ocultar coluna se `month[c] === 0 && total[c] === 0` (após filtro, células 0 ainda mostram se coluna visível).

Layout mobile: scroll horizontal na tabela se necessário (`overflow-x-auto`).

Substituir `{participant.counter}` por tabela abaixo do nome.

### Critérios de aceite

- [ ] Duas linhas Este mês / Total
- [ ] Coluna da designação em aberto à esquerda (após "Quando")

---

## 7.2 — Colunas e sortCategory

### O que fazer

Receber `sortCategory` do response root (`EligibleParticipantsResult.sortCategory`) e passar para cada `EligibleOption`.

Função `buildVisibleColumns(sortCategory, month, total)`.

### Critérios de aceite

- [ ] Slot leitor: coluna Titular aparece primeiro entre contagens
- [ ] Slot oração: coluna Oração primeiro

---

## 7.3 — `onOpenChange` para swipe guard

### O que fazer

```typescript
export type ParticipantPickerProps = {
  // ...existing
  onOpenChange?: (open: boolean) => void;
};
```

Chamar `onOpenChange(true)` em `openDropdown`, `onOpenChange(false)` em `closeDropdown`.

Week page usa para `setPickerOpenCount` ou `isAnyPickerOpen`.

### Critérios de aceite

- [ ] Callback dispara ao abrir/fechar dropdown

### Não fazer

- Não implementar swipe nesta task (task 8)

---

## Verificação do grupo

Manual: abrir picker em slot Tesouros (titular) → ver tabelinha com colunas relevantes; verificar mobile scroll.

## Handoff

Picker completo; week page pode usar `onOpenChange` para swipe.
