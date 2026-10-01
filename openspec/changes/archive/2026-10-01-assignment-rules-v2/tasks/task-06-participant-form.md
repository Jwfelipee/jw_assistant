# Task 6 — Participant form

**Change:** `assignment-rules-v2`  
**Grupo:** 6 de 8  
**Pré-requisitos:** [task-01](./task-01-schema-and-migration.md)  
**Desbloqueia:** nenhuma (paralelo com 5, 7)

## Objetivo do grupo

Default Batizado, checkbox Qualificado condicional, exibição em detail/edit.

## Contexto para o subagent

- Form: `apps/web/src/components/participant-form.tsx` — default `Privilege.PUBLISHER` linha 31
- Create: `apps/web/src/app/(app)/participants/new/page.tsx`
- Edit/detail: `apps/web/src/app/(app)/participants/[id]/page.tsx`
- Labels: `apps/web/src/lib/participants.ts`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/participant-form.tsx` | editar |
| `apps/web/src/app/(app)/participants/[id]/page.tsx` | editar (se detail separado) |

---

## 6.1 — Default Batizado

### O que fazer

```typescript
const [privilege, setPrivilege] = useState<Privilege>(
  initial?.privilege ?? Privilege.BAPTIZED,
);
```

No `useEffect` que ajusta privilégio ao mudar sexo, fallback `Privilege.BAPTIZED` em vez de `PUBLISHER`.

### Critérios de aceite

- [ ] Formulário novo abre com Batizado selecionado

---

## 6.2 — Checkbox Qualificado

### O que fazer

```typescript
const [qualified, setQualified] = useState(initial?.qualified ?? false);
```

Renderizar só se `privilege === Privilege.BAPTIZED`:

```tsx
{privilege === Privilege.BAPTIZED ? (
  <label>
    <input type="checkbox" checked={qualified} onChange={...} />
    Qualificado
  </label>
) : null}
```

Ao mudar privilégio away from BAPTIZED, reset `qualified` false no submit.

Incluir `qualified` no `onSubmit` payload.

### Critérios de aceite

- [ ] Checkbox visível só para Batizado
- [ ] Create/update persiste qualified

---

## 6.3 — Detail e edit

### O que fazer

Na página de detalhe/edição, mostrar "Qualificado: Sim/Não" quando Batizado, ou checkbox no form de edição.

### Critérios de aceite

- [ ] Participante batizado qualificado exibe estado corretamente

### Não fazer

- Não alterar lista de participantes além do necessário

---

## Verificação do grupo

Manual: criar batizado qualificado → verificar GET → editar para Publicador → qualified zerado no backend.

## Handoff

Cadastro alinhado com regras de elegibilidade task 3.
