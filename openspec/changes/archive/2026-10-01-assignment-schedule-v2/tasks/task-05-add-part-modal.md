# Task 5 — Add part modal

**Change:** `assignment-schedule-v2`  
**Grupo:** 5 de 6  
**Pré-requisitos:** (nenhum — pode paralelizar com 4)  
**Desbloqueia:** UX de adicionar partes contextual

## Objetivo do grupo

Substituir o formulário genérico no final da semana por botões `+` nas seções FSM e NVC que abrem modal com seção pré-selecionada.

## Contexto para o subagent

- Week page: `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx`
- Estado atual: `addTopic`, `addPartTypeId`, `addTitle`, `onAddPart` form no final (~linhas 531–602)
- API existente: `addWeekPart(weekId, partTypeId, title?)` em `@/lib/schedule`
- Catálogo: `listPartTypes(PartTopic.MINISTRY)` e `listPartTypes(PartTopic.CHRISTIAN_LIFE)` já carregados
- NVC types filtrados: `nvcTypes.filter(t => t.code !== 'ESTUDO_BIBLICO')`
- Seções renderizadas via `partsByTopic` — FSM = `PartTopic.MINISTRY`, NVC = `PartTopic.CHRISTIAN_LIFE`

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/add-week-part-modal.tsx` | criar |
| `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx` | editar |

---

## 5.1 — AddWeekPartModal component

### O que fazer

Props:

```typescript
type AddWeekPartModalProps = {
  open: boolean;
  onClose: () => void;
  topic: PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE;
  partTypes: PartTypeDto[];
  onConfirm: (partTypeId: string, title?: string) => Promise<void>;
  pending?: boolean;
};
```

UI:
- Overlay + painel central (mobile full-width com padding)
- Título: "Adicionar parte — {TOPIC_LABELS[topic]}"
- Select tipo (lista `partTypes` já filtrada pelo parent)
- Input tema opcional (max 300)
- Botões Cancelar / Adicionar
- Fechar com Escape e clique fora
- `role="dialog"` + `aria-modal="true"`

### Critérios de aceite

- [ ] Modal acessível
- [ ] Tipo obrigatório; tema opcional
- [ ] Loading no botão durante `onConfirm`

---

## 5.2 — Integrate in week page

### O que fazer

1. Remover seção "Adicionar parte" do final da página (form completo)
2. No header de cada seção em `partsByTopic`:
   - Se `topic === MINISTRY` → botão `+ Adicionar parte` ao lado do h2
   - Se `topic === CHRISTIAN_LIFE` → idem (estudo não recebe botão — está dentro da seção mas não é deletable)
3. Estado modal:
   ```typescript
   const [addModalTopic, setAddModalTopic] = useState<PartTopic.MINISTRY | PartTopic.CHRISTIAN_LIFE | null>(null);
   ```
4. `onConfirm`: chamar `addWeekPart(week.id, partTypeId, title)`, `load()`, fechar modal

### Critérios de aceite

- [ ] FSM: modal só mostra tipos FSM
- [ ] NVC: modal só mostra tipos NVC (sem estudo)
- [ ] Parte aparece na seção correta após adicionar
- [ ] Formulário do rodapé removido

### Não fazer

- Não adicionar botão em Tesouros ou Fora de tópico

---

## 5.3 — Smoke test

### O que fazer

1. Abrir semana → FSM → `+` → adicionar "Discurso" com tema
2. NVC → `+` → adicionar parte NVC
3. Verificar lista atualizada sem reload manual

### Critérios de aceite

- [ ] Ambos os fluxos funcionam em mobile viewport

---

## Verificação do grupo

Browser na tela da semana; adicionar partes via modal.

## Handoff para próxima task

Partes adicionadas respeitam `sortOrder` — task 6 permite reordenar depois.
