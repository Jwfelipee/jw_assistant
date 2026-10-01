# Task 3 — Picker filters UI

**Change:** `participant-picker-filters`  
**Grupo:** 3 de 5  
**Pré-requisitos:** [task-01](./task-01-last-assignment-on-eligible-api.md)  
**Desbloqueia:** [task-05](./task-05-picker-filters-smoke.md)

## Objetivo do grupo

Barra de filtros no dropdown do `ParticipantPicker` com estado por `slotId`.

## Contexto para o subagent

- `apps/web/src/components/participant-picker.tsx`
- `PRIVILEGE_LABELS` — `@/lib/participants`
- `AssignmentRole`, `Sex` — `@jw/shared`
- Labels de papel: `ROLE_LABELS` em `@/lib/schedule`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/participant-picker.tsx` | editar |

---

## 3.1 — Filter bar

### O que fazer

Dentro do painel dropdown (acima da lista), três `<select>`:

- Sexo: Todos | Homens | Mulheres
- Privilégio: Todos + cada `Privilege`
- Última designação: Qualquer | Titular | Ajudante | Dirigente | Leitor

Estilo compacto, mobile-friendly.

### Critérios de aceite

- [x] Filtros visíveis só quando dropdown aberto
- [x] Não dispara assign ao interagir com selects

---

## 3.2 — Estado por slot

### O que fazer

`useRef<Map<string, PickerFilters>>` ou estado elevado:

- Ao mudar `slotId`: carregar do map ou defaults vazios
- Ao alterar filtro: persistir no map para `slotId` atual
- Botão **Limpar filtros** reseta os três selects para “Todos/Qualquer” no slot atual

Trocar de slot na week page e voltar ao slot anterior restaura filtros salvos.

### Critérios de aceite

- [x] Cenários da spec “reset when changing slot” e “restore same slot”

---

## 3.3 — Pipeline de lista

### O que fazer

```typescript
const filtered = useMemo(() => {
  return data.eligible
    .filter(sex)
    .filter(privilege)
    .filter(lastRole) // compare lastAssignment?.role; exclude null when filter set
    .filter(name query);
}, [...]);
```

Empty state: “Nenhum participante com esses filtros” + hint para limpar.

### Critérios de aceite

- [x] Busca por nome combina com AND nos filtros
- [x] `ineligibleVisible` não é filtrado por sexo/privilégio extras

### Não fazer

- Não persistir em localStorage

---

## Verificação do grupo

`pnpm --filter web typecheck`

## Handoff

Task-04 adiciona strip no mesmo componente.
