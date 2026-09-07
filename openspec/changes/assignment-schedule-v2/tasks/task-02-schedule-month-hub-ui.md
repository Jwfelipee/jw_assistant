# Task 2 — Schedule month hub UI

**Change:** `assignment-schedule-v2`  
**Grupo:** 2 de 6  
**Pré-requisitos:** [task-01](./task-01-month-horizon-and-list-api.md)  
**Desbloqueia:** (navegação completa na aba Designações)

## Objetivo do grupo

Substituir o redirect automático da aba Designações por um hub de meses com status visual, agrupando planejamento (atual + 6) e meses anteriores.

## Contexto para o subagent

- Arquivo atual: `apps/web/src/app/(app)/schedule/page.tsx` — só faz `router.replace(next.href)`
- Detalhe do mês: `apps/web/src/app/(app)/schedule/[yearMonth]/page.tsx` — lista semanas + export PDF
- Helpers: `listScheduleMonths`, `ensureHorizon`, `formatYearMonthLabel` em `@/lib/schedule`
- Design tokens: variáveis CSS `--accent`, `--muted`, `--danger`, `--surface` (ver páginas existentes)
- Mobile-first, bottom nav fixa — reservar padding inferior

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/app/(app)/schedule/page.tsx` | editar (reescrita) |
| `apps/web/src/app/(app)/schedule/[yearMonth]/page.tsx` | editar (link voltar) |
| `apps/web/src/components/month-status-badge.tsx` | criar (opcional, recomendado) |

---

## 2.1 — Month hub page

### O que fazer

Reescrever `schedule/page.tsx`:

1. Estado: `months`, `loading`, `error`
2. No mount: `ensureHorizon()` → `listScheduleMonths()`
3. Agrupar meses:
   - **Planejamento**: `isInHorizon === true` (atual + 6), ordenar asc
   - **Meses anteriores**: `isPast === true`, ordenar desc
4. Cada item: `formatYearMonthLabel`, `MonthStatusBadge`, link para `/schedule/[yearMonth]`
5. Badge lógica:
   - `complete` → "Completo" (verde/sucesso)
   - `openSlots > 0` e algum slot preenchido → "Pendente · N em aberto"
   - `openSlots === total` ou mês recém-criado → "Em aberto"
6. Destacar `isCurrent` visualmente (borda accent)
7. Header: título "Designações", subtítulo explicando planejamento

**Não** redirecionar automaticamente — usuário escolhe o mês.

### Critérios de aceite

- [ ] Abrir aba Designações mostra hub, não redirect
- [ ] Meses com status correto
- [ ] Meses passados editáveis via mesmo link
- [ ] Mobile: lista scrollável, touch targets ≥ 44px

### Não fazer

- Não remover `fetchNextMonth` do dashboard home (`page.tsx` raiz)

---

## 2.2 — ensureHorizon on mount

### O que fazer

Chamar `ensureHorizon()` antes de `listScheduleMonths()` com loading state "Preparando meses…".

Tratar erro com `role="alert"` e retry.

### Critérios de aceite

- [ ] Primeiro acesso cria meses em branco até +6
- [ ] Loading visível durante provisionamento

---

## 2.3 — Back link no detalhe do mês

### O que fazer

Em `[yearMonth]/page.tsx`, adicionar no header:

```tsx
<Link href="/schedule">← Todos os meses</Link>
```

Manter export PDF e lista de semanas inalterados.

### Critérios de aceite

- [ ] Link visível e funcional
- [ ] Export S-140 continua funcionando

---

## 2.4 — Smoke test

### O que fazer

Fluxo manual:
1. Login → Designações → vê hub com ≥7 meses no planejamento
2. Abre mês pendente → semanas → volta ao hub
3. Abre mês passado (se existir no seed) → editável

### Critérios de aceite

- [ ] Fluxo completo sem erros de console

---

## Verificação do grupo

Browser: abrir `/schedule`, confirmar hub com badges e navegação.

## Handoff para próxima task

Hub pronto; histórico "Por mês" pode reutilizar `MonthStatusBadge` e `listScheduleMonths`.
