# Task 3 — Participant picker component

**Change:** `assignment-ux-improvements`  
**Grupo:** 3 de 4  
**Pré-requisitos:** [task-01](./task-01-eligible-participants-api.md) (endpoint real; pode mockar temporariamente)  
**Desbloqueia:** [task-04](./task-04-week-schedule-ux-integration.md)

## Objetivo do grupo

Criar componente reutilizável `ParticipantPicker` — combobox com busca por nome, lista filtrada por elegibilidade e seção inferior de inelegíveis visíveis.

## Contexto para o subagent

- Sem shadcn/ui — apenas React 19 + Tailwind 4
- Padrões visuais: variáveis CSS em week page (`--ink`, `--muted`, `--line`, `fieldClass`, etc.)
- Labels de privilégio: `PRIVILEGE_LABELS` em `apps/web/src/lib/participants.ts`
- Endpoint: `GET /slots/:id/eligible-participants` (task 1)

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/participant-picker.tsx` | criar |
| `apps/web/src/lib/schedule.ts` | editar |

---

## 3.1 — Componente ParticipantPicker

### O que fazer

Criar `apps/web/src/components/participant-picker.tsx`:

**Props:**

```typescript
type ParticipantPickerProps = {
  slotId: string;
  value: string | null;          // participantId atual
  participantName?: string | null; // para exibir quando fechado
  disabled?: boolean;
  busy?: boolean;
  onSelect: (participantId: string) => void;
};
```

**Comportamento:**

1. Ao focar/abrir: `fetch` elegíveis via `listEligibleParticipants(slotId)`
2. Input mostra nome do selecionado ou placeholder "Buscar participante…"
3. Ao digitar: filtrar `eligible` por substring do nome (case-insensitive, normalizar acentos opcional)
4. Lista dropdown:
   - Itens elegíveis clicáveis — nome + badge privilégio + contador
   - Separador visual
   - `ineligibleVisible` — texto cinza (`text-[var(--muted)]`), `cursor-not-allowed`, mostra `reason` abaixo do nome
5. Ao clicar elegível → `onSelect(id)`, fechar dropdown
6. Estados: loading, erro (mensagem inline), vazio ("Nenhum participante elegível")
7. Click outside fecha dropdown

**Acessibilidade mínima:**

- `role="combobox"` no input
- `aria-expanded`, `aria-controls`
- ↑↓ para navegar, Enter para selecionar, Escape para fechar

### Critérios de aceite

- [ ] Busca filtra lista em tempo real
- [ ] Inelegíveis visíveis não são clicáveis
- [ ] Mobile: lista com `max-h` scrollável, targets ≥ 44px
- [ ] Exibe spinner/“Carregando…” durante fetch

### Não fazer

- Não chamar `assignSlot` dentro do componente (só `onSelect`)
- Não usar bibliotecas externas de combobox

---

## 3.2 — Client API listEligibleParticipants

### O que fazer

Em `apps/web/src/lib/schedule.ts`:

```typescript
export type EligibleParticipant = {
  id: string;
  name: string;
  sex: string;
  privilege: string;
  counter: number;
};

export type IneligibleVisible = {
  id: string;
  name: string;
  reasonCode: string;
  reason: string;
};

export type EligibleParticipantsResult = {
  slotId: string;
  role: AssignmentRole;
  eligible: EligibleParticipant[];
  ineligibleVisible: IneligibleVisible[];
};

export async function listEligibleParticipants(
  slotId: string,
): Promise<EligibleParticipantsResult> {
  const res = await fetch(`/api/slots/${slotId}/eligible-participants`, {
    credentials: "include",
    cache: "no-store",
  });
  // ... error handling como assignSlot
}
```

### Critérios de aceite

- [ ] Tipos exportados e usados pelo componente
- [ ] Erros de API viram mensagem pt-BR

### Não fazer

- Não cachear globalmente entre páginas (cache local no componente é ok)

---

## 3.3 — Polish mobile e teclado

### O que fazer

- Garantir que o dropdown não é cortado em viewports pequenas
- Input `font-size` ≥ 16px no mobile (evitar zoom iOS)
- Highlight do item focado via teclado
- Testar com lista de ~70 nomes (performance aceitável com filtro local)

### Critérios de aceite

- [ ] Navegação por teclado funciona
- [ ] Sem layout break em 375px width

### Não fazer

- Não integrar na week page nesta task (task 4)

---

## Verificação do grupo

Renderizar componente isolado em Storybook **não existe** — verificar via import temporário ou aguardar task 4.

Checklist manual após task 4:
- Abrir picker → lista carrega
- Digitar "mar" → filtra
- Item cinza não seleciona

## Handoff para próxima task

- `ParticipantPicker` exportado de `components/participant-picker.tsx`
- `listEligibleParticipants` no client schedule
