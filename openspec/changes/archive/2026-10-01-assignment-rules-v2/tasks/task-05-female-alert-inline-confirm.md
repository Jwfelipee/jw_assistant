# Task 5 — Female alert and inline confirmation

**Change:** `assignment-rules-v2`  
**Grupo:** 5 de 8  
**Pré-requisitos:** [task-03](./task-03-eligibility-qualified-rules.md)  
**Desbloqueia:** [task-08](./task-08-week-view-whatsapp-navigation.md) (parcial — week page)

## Objetivo do grupo

Adicionar alerta `FEMALE_REPEAT_MONTH` sempre para mulheres na 2ª+ designação do mês e corrigir UX de confirmação inline no slot.

## Contexto para o subagent

- Soft alerts: `assign-rules.ts` — `SoftAlertCode`, `buildRepeatMonthAlert`
- `collectSoftAlerts`: `schedule.service.ts` ~976
- Week page: `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx`
  - `pendingConfirm` state global (linha ~62)
  - Banner no topo (linha ~497) — **mover para slot**
- Bug reportado: picker fecha, slot vazio, usuário não vê confirmação

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/schedule/assign-rules.ts` | editar |
| `apps/api/src/schedule/schedule.service.ts` | editar |
| `apps/web/src/app/(app)/schedule/[yearMonth]/weeks/[weekId]/page.tsx` | editar |
| `apps/api/src/schedule/assign-rules.spec.ts` | editar |

---

## 5.1 — `FEMALE_REPEAT_MONTH` alert

### O que fazer

```typescript
export type SoftAlertCode =
  | 'REPEAT_MONTH'
  | 'MIXED_SEX_PAIR'
  | 'FEMALE_REPEAT_MONTH';

export function buildFemaleRepeatMonthAlert(
  sex: Sex,
  alreadyAssignedInMonth: boolean,
): SoftAlert | null {
  if (sex !== Sex.FEMALE || !alreadyAssignedInMonth) return null;
  return {
    code: 'FEMALE_REPEAT_MONTH',
    message:
      'Esta participante já possui designação neste mês. Confirme se deseja designá-la novamente.',
  };
}
```

Em `collectSoftAlerts`, após contagem `otherInMonth`:

```typescript
const femaleRepeat = buildFemaleRepeatMonthAlert(input.sex as Sex, otherInMonth > 0);
if (femaleRepeat) alerts.push(femaleRepeat);
```

Manter `REPEAT_MONTH` via AlertConfig para não-regime feminino (homens e config por privilégio). Para mulheres, **sempre** emitir `FEMALE_REPEAT_MONTH` na 2ª+ (pode coexistir com REPEAT_MONTH — deduplicar mensagem se ambos).

### Critérios de aceite

- [ ] Mulher 2ª vez no mês retorna `requiresConfirmation: true`
- [ ] Mulher 1ª vez no mês não alerta (semana diferente ok)
- [ ] Ancião feminino (pioneira) também alerta

---

## 5.2 — Confirmação inline no slot

### O que fazer

Refatorar `renderSlot` / bloco do slot em `page.tsx`:

Quando `pendingConfirm?.slotId === slot.id`, renderizar **abaixo do picker** (não só no topo):

```tsx
{pendingConfirm?.slotId === slot.id ? (
  <div role="alert" className="...">
    <ul>{pendingConfirm.alerts.map(...)}</ul>
    <button onClick={onConfirmAlerts}>Confirmar designação</button>
    <button onClick={() => setPendingConfirm(null)}>Cancelar</button>
  </div>
) : null}
```

Opcional: manter banner no topo como duplicata acessível OU remover topo para evitar confusão (preferir **só inline**).

### Critérios de aceite

- [ ] Alerta visível sem scroll na área do slot afetado
- [ ] Confirmar persiste designação e recarrega semana

---

## 5.3 — Fix picker vazio durante pending

### O que fazer

Enquanto `pendingConfirm` ativo para o slot:

- Passar `participantName` temporário ao picker: nome do participante selecionado (buscar de `data.eligible` ou estado local `pendingParticipantName`)
- Ou manter input com nome até confirm/cancel

Estado sugerido:

```typescript
const [pendingConfirm, setPendingConfirm] = useState<{
  slotId: string;
  participantId: string;
  participantName: string;
  alerts: SoftAlert[];
} | null>(null);
```

No `applyAssign` quando `requiresConfirmation`, guardar `participantName` do picker.

### Critérios de aceite

- [ ] Após selecionar mulher 2ª no mês, nome permanece visível no campo
- [ ] Cancelar limpa pending e restaura estado anterior

### Não fazer

- Não remover FEMALE_WEEK_LIMIT

---

## Verificação do grupo

Manual: designar mulher semana 1 → designar mesma mulher semana 2 do mês → ver alerta inline → confirmar → slot preenchido.

## Handoff

Fluxo de confirmação corrigido; pronto para integração com WhatsApp na mesma página.
