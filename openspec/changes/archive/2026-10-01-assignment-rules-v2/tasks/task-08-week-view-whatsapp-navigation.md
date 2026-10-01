# Task 8 — Week view WhatsApp and navigation

**Change:** `assignment-rules-v2`  
**Grupo:** 8 de 8  
**Pré-requisitos:** [task-05](./task-05-female-alert-inline-confirm.md), [task-07](./task-07-participant-picker-counts.md)  
**Desbloqueia:** nenhuma (última task)

## Objetivo do grupo

WhatsApp por slot designado, navegação prev/next dentro do mês, swipe touch lateral.

## Contexto para o subagent

- Week page: `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx`
- Já carrega `month` via `ensureMonth(yearMonth)` para resolver semana
- `WeekView`: `id`, `weekStartDate`, `meetingDate`
- Slot row: botões Sugerir/Limpar ~linha 419
- API enriched inclui `phone` no eligible — para assignee, usar phone do participante no slot view (pode precisar incluir `participantPhone` em `SlotView` ou buscar do eligible cache)

Verificar se `SlotView` expõe phone — se não, adicionar em API `toSlotView`:

```typescript
participantPhone: string | null;
```

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/lib/whatsapp.ts` | criar |
| `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx` | editar |
| `apps/api/src/schedule/schedule.service.ts` | editar (SlotView phone opcional) |
| `apps/web/src/lib/schedule.ts` | editar (SlotView type) |

---

## 8.1 — Helper WhatsApp

### O que fazer

`apps/web/src/lib/whatsapp.ts`:

```typescript
export function normalizePhoneForWaMe(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function buildAssignmentWhatsAppMessage(input: {
  meetingDate: string;       // formatDateBr
  partTitle: string;         // weekPart.title || partTypeLabel
  slotRole: AssignmentRole;
  titularName?: string | null;
  ajudanteOrLeitorName?: string | null;
  focusRole: AssignmentRole; // role do slot do botão clicado
}): string { ... }
```

Formatação:

- Papel do slot clicado: `*Nome*`
- Outro papel na mesma parte: `_Nome_`
- Parte solo: só uma linha de papel

Exemplo output:

```
Sua designação — Reunião do meio de semana

📅 *05/09/2026*
📋 *Tesouros da Palavra de Deus*
👤 Titular: *Wilson Pereira*
👤 Ajudante: _Maria Silva_
```

```typescript
export function whatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneForWaMe(phone)}?text=${encodeURIComponent(message)}`;
}
```

### Critérios de aceite

- [ ] `11999999999` → `5511999999999`
- [ ] Mensagem com bold/italic correto por focusRole

---

## 8.2 — Botão WhatsApp no slot

### O que fazer

No `btnRowClass` do slot, após Limpar:

```tsx
{slot.participantPhone ? (
  <a
    href={whatsAppUrl(slot.participantPhone, message)}
    target="_blank"
    rel="noopener noreferrer"
    className={btnOutline}
  >
    WhatsApp
  </a>
) : null}
```

Construir `message` com dados da parte (titular/ajudante/leitor dos sibling slots).

Garantir `participantPhone` no payload da semana (enriquecer `toSlotView`).

### Critérios de aceite

- [ ] Botão só com telefone
- [ ] Abre wa.me em nova aba

---

## 8.3 — Footer prev/next

### O que fazer

Após listagem de partes (`partsByTopic`), antes do fechamento do `<main>`:

```typescript
const weekIndex = month?.weeks.findIndex(w => w.id === weekId) ?? -1;
const prevWeek = weekIndex > 0 ? month!.weeks[weekIndex - 1] : null;
const nextWeek =
  weekIndex >= 0 && weekIndex < month!.weeks.length - 1
    ? month!.weeks[weekIndex + 1]
    : null;
```

```tsx
<nav className="flex justify-between border-t pt-4">
  {prevWeek ? (
    <Link href={`/schedule/${yearMonth}/weeks/${prevWeek.id}`}>
      ← Semana anterior
    </Link>
  ) : <span />}
  {nextWeek ? (
    <Link href={`/schedule/${yearMonth}/weeks/${nextWeek.id}`}>
      Próxima semana →
    </Link>
  ) : null}
</nav>
```

Última semana: **sem** link próximo (nem elemento vazio clicável).

### Critérios de aceite

- [ ] Primeira semana: só próximo (se houver)
- [ ] Última semana: só anterior
- [ ] Semana única: nenhum botão

---

## 8.4 — Swipe touch

### O que fazer

```typescript
const [pickerOpen, setPickerOpen] = useState(false);

// ParticipantPicker onOpenChange={setPickerOpen}

useEffect(() => {
  if (typeof window === 'undefined') return;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) return;

  let startX = 0, startY = 0;

  function onTouchStart(e: TouchEvent) {
    if (pickerOpen) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }

  function onTouchEnd(e: TouchEvent) {
    if (pickerOpen) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0 && nextWeek) router.push(...);
    if (dx > 0 && prevWeek) router.push(...);
  }

  mainRef.current?.addEventListener('touchstart', onTouchStart, { passive: true });
  mainRef.current?.addEventListener('touchend', onTouchEnd, { passive: true });
  // cleanup
}, [pickerOpen, prevWeek, nextWeek, yearMonth, router]);
```

**Crítico:** na última semana, `nextWeek === null` → swipe esquerda não navega.

### Critérios de aceite

- [ ] Swipe não funciona em desktop (pointer fine)
- [ ] Swipe bloqueado com picker aberto
- [ ] Última semana: sem avanço por swipe

### Não fazer

- Não navegar para outro mês
- Não adicionar swipe com mouse

---

## Verificação do grupo

Manual completo:

1. Slot com telefone → WhatsApp abre mensagem correta
2. Navegar prev/next por botões
3. Em device touch (ou emulador): swipe entre semanas
4. Última semana do mês: sem próximo botão nem swipe forward

## Handoff

Change `assignment-rules-v2` completa para archive após QA.
