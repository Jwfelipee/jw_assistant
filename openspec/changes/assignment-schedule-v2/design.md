## Context

A change `midweek-assignment-system` entregou o motor de designação, PDF básico e histórico por designação. A change `assignment-ux-improvements` melhorou a tela da semana (picker, auto-assign, tema inline). O gap atual é **navegação temporal**, **fidelidade visual do PDF** e **UX de partes extras**.

Estado relevante do codebase:

- `/schedule` → `fetchNextMonth()` → redirect para um único mês
- `monthCompleteness()` privado em `schedule.service.ts` — já calcula `complete` e `openSlots`
- `ensureMonth(yearMonth)` cria mês + semanas sob demanda
- `S-140.docx` na root: layout tabular com numeração 1–10, durações, cânticos, comentários iniciais/finais, uma semana por bloco/página
- PDF atual (`s140-document.tsx`): todas as semanas numa única página A4, sem numeração, sem durações, sem cânticos/comentários, layout simplificado
- `sortOrder` em `WeekPart` — sem endpoint de reorder
- Formulário "Adicionar parte" no final de `weeks/[weekId]/page.tsx`

Decisões do usuário (explore):

1. Meses passados **editáveis** + consulta + PDF
2. Horizonte: **6 meses à frente** a partir do **mês civil atual**
3. Histórico mensal na aba Histórico como **sub-aba**
4. Sempre manter **6 meses à frente criados em branco**
5. PDF: melhorar react-pdf atual (não DOCX)
6. Reordenar FSM/NVC por **arrastar** (exceto estudo)

## Goals / Non-Goals

**Goals:**

- Hub de Designações com visão de meses (passado + atual + 6 à frente) e status visual
- Provisionamento automático do horizonte de 7 meses (atual + 6)
- Sub-aba "Por mês" no Histórico
- PDF com layout tabular fiel ao S-140.docx (referência visual em `S-140.docx`)
- `+` contextual em FSM/NVC com modal
- Drag-and-drop para reordenar FSM/NVC

**Non-Goals:**

- DOCX export ou LibreOffice
- Cânticos/leitura bíblica editáveis no sistema
- Reordenar tesouros ou partes fora de tópico

## Decisions

### D1 — Horizonte de meses (`ensureHorizon`)

Novo método `ensureHorizon(now?: Date)` em `ScheduleService`:

- Calcula `currentYearMonth(now)` e `addMonths(ym, 0..6)` → 7 meses
- Para cada mês: chama `ensureMonth(yearMonth)` (idempotente)
- Invocado em:
  - `GET /schedule/months` (antes de listar)
  - `POST /schedule/horizon/ensure` (explícito, usado no boot da aba Designações)
- Meses passados **não** são auto-criados pelo horizonte (só existem se já foram usados)

### D2 — `GET /schedule/months`

Query: `from` e `to` opcionais (`YYYY-MM`). Default:

- `from` = sem limite inferior (todos os meses existentes no banco com `year_month < current`)
- `to` = mês civil atual + 6

Resposta:

```json
{
  "currentYearMonth": "2026-09",
  "horizonEnd": "2027-03",
  "months": [
    {
      "yearMonth": "2026-09",
      "exists": true,
      "complete": false,
      "openSlots": 3,
      "weekCount": 4,
      "isPast": false,
      "isCurrent": true,
      "isInHorizon": true,
      "href": "/schedule/2026-09"
    }
  ]
}
```

`monthCompleteness` extraído para método reutilizável. Meses no banco fora do horizonte futuro aparecem na lista quando `isPast: true`.

### D3 — Hub da aba Designações

Substituir redirect em `/schedule/page.tsx` por **hub de meses**:

- Destaque no mês civil atual (ou mês selecionado via query `?month=YYYY-MM`)
- Lista agrupada: **Planejamento** (atual + até +6), **Anteriores** (todos os meses passados existentes)
- Badge por mês: `Completo` (verde) | `Pendente` (âmbar, com contagem) | `Em aberto` (neutro, 0 slots preenchidos mas estrutura existe)
- Clicar no mês → `/schedule/[yearMonth]` (inalterado, com semanas + exportar)
- Meses passados abrem a mesma UI editável

`/schedule/[yearMonth]/page.tsx` ganha link "← Todos os meses" para o hub.

### D4 — Histórico com sub-abas

`apps/web/src/app/(app)/history/page.tsx` → layout com tabs:

| Sub-aba | Conteúdo |
|---------|----------|
| **Por designação** | UI atual (filtros + lista paginada) |
| **Por mês** | Lista de meses (`GET /schedule/months`) com status; clique abre `/schedule/[yearMonth]` |

Implementação: componente `HistoryTabs` com estado em URL (`?view=assignments|months`) para deep-link.

### D5 — PDF fiel ao S-140.docx (react-pdf)

Gap analysis (docx vs implementação atual):

| Elemento S-140 | Atual | Ação |
|----------------|-------|------|
| Uma semana por página | Todas numa página | `<Page>` por semana |
| Cabeçalho `[DATA] \| LEITURA SEMANAL DA BÍBLIA` | Data por extenso separada | Formato curto `dd/MM/yyyy` + sufixo fixo |
| Presidente + Oração inicial (linha superior) | Sim, simplificado | Layout tabular 2 colunas |
| Cântico [número] (abertura) | Ausente | Linha com placeholder `[número]` |
| Comentários iniciais (1 min) | Ausente | Linha fixa com placeholder de nome |
| Seção Tesouros + "Salão principal" | Cabeçalho colorido simples | Barra de seção + sublabel |
| Partes 1–3 numeradas com duração | Sem número/duração | `1. Tema (10 min)` etc. |
| FSM 4–7 numeradas + duração + par | Sem número/duração | Numeração contínua + `(X min)` |
| NVC: cântico + partes 8–9 + estudo 10 | Sem cântico/numeração | Replicar estrutura |
| Comentários finais (3 min) | Ausente | Linha fixa |
| Cântico + Oração final | Só oração final | Adicionar cântico placeholder |
| Coluna de tempo `0:00` | Ausente | Coluna à direita (placeholder) |
| Nome/Nome para pares | Sim | Manter |

**Durações**: mapa estático em `s140-model.ts` por `partTypeCode` (sem migration):

```typescript
const S140_DURATIONS: Record<string, string> = {
  TESOUROS: '10 min',
  JOIAS: '10 min',
  LEITURA_BIBLIA: '4 min',
  ESTUDO_BIBLICO: '30 min',
  // FSM/NVC default: 'X min' / 'XX min'
};
```

**Numeração**: sequencial 1–10 por semana conforme ordem S-140 (fora de tópico não numerado; tesouros 1–3; FSM 4+; NVC 8+; estudo sempre 10).

**Comentários iniciais/finais**: linhas fixas no PDF (não são partes no banco) — nomes permanecem como `____________` até haver modelo de dados.

**Referência visual**: manter `S-140.docx` no repo; comparar export de seed side-by-side na verificação.

### D6 — Modal "Adicionar parte"

- Botão `+ Adicionar` no cabeçalho de cada seção FSM e NVC (não em Tesouros nem fora de tópico)
- Modal com: tipo (select filtrado pela seção), tema opcional, confirmar/cancelar
- Remove o formulário fixo no final da página
- Reutiliza `addWeekPart(weekId, partTypeId, title?)` existente

### D7 — Reordenar partes (drag)

**API**: `PATCH /schedule/weeks/:weekId/parts/reorder`

```json
{ "orderedPartIds": ["id1", "id2", "id3"] }
```

Validações:

- Todos os IDs pertencem à semana
- Apenas partes `MINISTRY` e `CHRISTIAN_LIFE` exceto `ESTUDO_BIBLICO`
- Ordem relativa de tesouros, fora de tópico e estudo **inalterada**
- Recalcula `sortOrder` mantendo faixas: FSM 20–89, NVC 30–89, estudo fixo em 90

**UI**: `@dnd-kit/sortable` em cada lista FSM e NVC separadamente; handle de arraste à esquerda; persistir ao `onDragEnd`.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| PDF nunca 100% idêntico ao Word | Aceitar paridade visual próxima; revisão lado a lado com docx |
| `ensureHorizon` em cada request lento | Idempotente; só cria o que falta; cache leve opcional |
| Drag em mobile | `@dnd-kit` com touch sensor; alvos ≥ 44px |
| Muitos meses passados na lista | Ordenar desc; scroll; só meses que existem no banco |

## Migration

Nenhuma migration de banco. Deploy API + web juntos. Primeiro login após deploy cria horizonte de 7 meses.
