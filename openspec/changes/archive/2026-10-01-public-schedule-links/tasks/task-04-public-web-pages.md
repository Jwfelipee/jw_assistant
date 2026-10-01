# Task 4 — Public web pages and middleware

**Change:** `public-schedule-links`
**Grupo:** 4 de 5
**Pré-requisitos:** [3. Public schedule API](./task-03-public-schedule-api.md)
**Desbloqueia:** (nenhum — task final de UX pública)

## Objetivo do grupo

Criar as quatro páginas públicas com view lista mobile, modo impressão S-140-like, e liberar rotas no middleware.

## Contexto para o subagent

- Middleware: `apps/web/src/middleware.ts` — `PUBLIC_PATHS = ["/login"]`
- Layout autenticado: `apps/web/src/app/(app)/layout.tsx` com `BottomNav` — **não** usar para páginas públicas
- API rewrite: `next.config.ts` mapeia `/api/*` → API origin
- Referência S-140 HTML: `apps/api/src/pdf/s140-document.tsx`, `s140-model.ts` — copiar estrutura visual para CSS, não react-pdf
- Labels: `ROLE_LABELS`, `TOPIC_LABELS` em `apps/web/src/lib/schedule.ts`
- Slot vazio: renderizar `—`
- **Não** incluir telefone ou botões de edição

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/middleware.ts` | editar |
| `apps/web/src/app/(public)/layout.tsx` | criar |
| `apps/web/src/app/(public)/esta-semana/page.tsx` | criar |
| `apps/web/src/app/(public)/proxima-semana/page.tsx` | criar |
| `apps/web/src/app/(public)/este-mes/page.tsx` | criar |
| `apps/web/src/app/(public)/proximo-mes/page.tsx` | criar |
| `apps/web/src/lib/public-schedule.ts` | criar |
| `apps/web/src/components/public-schedule-list-view.tsx` | criar |
| `apps/web/src/components/public-schedule-print-view.tsx` | criar |
| `apps/web/src/lib/s140-display.ts` | criar (opcional — formatadores) |

---

## 4.1 — Middleware

### O que fazer

```typescript
const PUBLIC_PATHS = [
  "/login",
  "/esta-semana",
  "/proxima-semana",
  "/este-mes",
  "/proximo-mes",
];
```

Manter lógica existente: paths públicos acessíveis sem JWT.

### Critérios de aceite

- [ ] Visitante anônimo acessa `/esta-semana` sem redirect para `/login`
- [ ] `/schedule` continua exigindo auth

### Não fazer

- Não tornar `/schedule` público

---

## 4.2 — Route group (public)

### O que fazer

**`layout.tsx`** — layout mínimo:
- Fundo/surface consistente com design system (`--ink`, `--surface`, etc.)
- Sem `BottomNav`
- `<meta name="robots" content="noindex">` via `metadata` export
- Tipografia legível mobile-first

**Páginas** — padrão compartilhado via componente `PublicSchedulePage`:

```typescript
// apps/web/src/lib/public-schedule.ts
export type PublicScheduleView = { ... }; // espelhar API

export async function fetchPublicSchedule(
  slug: 'esta-semana' | 'proxima-semana' | 'este-mes' | 'proximo-mes'
): Promise<PublicScheduleView | { disabled: true } | { error: string }>
```

Cada `page.tsx` chama `fetchPublicSchedule` com slug correspondente.

Estados:
- **Loading** — "Carregando…"
- **Disabled** (404 API) — "Este link está desativado."
- **Empty** — `weeks.length === 0` — "Programação ainda não disponível."
- **Success** — render lista ou impressão

### Critérios de aceite

- [ ] Quatro rotas renderizam sem erro
- [ ] Layout sem navegação autenticada

### Não fazer

- Não duplicar lógica de fetch em 4 arquivos — extrair helper

---

## 4.3 — PublicScheduleListView

### O que fazer

Props: `view: PublicScheduleView`

Estrutura:

```
[Cabeçalho]
  Congregação XYZ
  Esta semana · 18/09/2026

[Por cada week — se mensal, repetir bloco]
  [Por cada PartTopic em ordem]
    Tópico label
    - Parte título
      Papel: Nome ou —
```

Estilo: cards ou lista com `min-h-[44px]` para toque, padding `--space-*`, sem interação.

Botão no topo: **Modo impressão** (alterna estado local `mode: 'list' | 'print'`).

### Critérios de aceite

- [ ] Slots vazios mostram `—`
- [ ] Responsivo em viewport 375px
- [ ] Sem telefone visível

### Não fazer

- Não adicionar ParticipantPicker

---

## 4.4 — PublicSchedulePrintView

### O que fazer

Criar `apps/web/src/lib/s140-display.ts` com:
- `DURATION_BY_CODE` (copiar de `s140-model.ts`)
- `formatPublicAssignees(slots)` — pares titular/ajudante, estudo dirigente/leitor
- `formatMeetingDateShort(iso)`

**`PublicSchedulePrintView`** — HTML/CSS:

- Tabela/lista com bordas finas
- Cabeçalho semana: `18/09/2026 | LEITURA SEMANAL DA BÍBLIA`
- Seções com barra colorida (cores de `s140-document.tsx`: treasures `#5a5a5a`, ministry `#b35c1e`, life `#6b2d5c`)
- Numeração de partes FSM/NVC
- Cânticos como placeholder `Cântico [número]` (igual PDF)
- Slots vazios: `—`

CSS:

```css
@media print {
  .no-print { display: none; }
  .print-page-break { page-break-after: always; }
}
```

Botões (classe `no-print`):
- **Voltar à lista**
- **Imprimir** → `window.print()`

Para view mensal: `page-break-after` entre semanas.

### Critérios de aceite

- [ ] Toggle lista ↔ impressão funciona
- [ ] `window.print()` abre diálogo
- [ ] Visual reconhecível como S-140 (seções, numeração, durações)

### Não fazer

- Não usar `@react-pdf/renderer` no client
- Não gerar PDF server-side

---

## 4.5 — Smoke test

### O que fazer

Manual ou script:

1. Logado, garantir mês/semana com dados no seed
2. Abrir `/esta-semana` em janela anônima
3. Verificar lista com nomes
4. Alternar modo impressão
5. Desabilitar link em settings (task 5) → verificar mensagem desativado

### Critérios de aceite

- [ ] 4 URLs funcionam sem login
- [ ] Link desabilitado mostra estado correto
- [ ] Mês sem dados mostra empty state

### Não fazer

- Não commitar screenshots nesta task

---

## Verificação do grupo

```bash
pnpm --filter web dev
# Navegador anônimo:
# http://localhost:3000/esta-semana
# http://localhost:3000/este-mes
```

## Handoff para próxima task

Páginas públicas consumindo API. Task 5 adiciona UI de cópia/toggle em settings.
