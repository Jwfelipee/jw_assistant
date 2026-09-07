## Why

A aba Designações hoje redireciona apenas ao próximo mês incompleto, sem visão de planejamento (6 meses à frente), sem indicadores de status por mês e sem acesso amigável ao histórico mensal. O PDF S-140 exportado não reproduz fielmente o formulário oficial (`S-140.docx`). Adicionar partes extras na semana exige um formulário genérico no final da página, e não há reordenação por arrastar nas seções FSM e NVC.

## What Changes

- **Horizonte de meses**: garantir automaticamente esqueleto em branco do mês civil atual + 6 meses à frente (semanas e partes padrão, slots vazios)
- **Navegação por mês na aba Designações**: hub com seletor, status (completo / pendente / em aberto), semanas e exportação PDF; meses passados permanecem editáveis
- **Histórico com sub-abas**: manter busca por designação individual; adicionar visão **Por mês** com arquivo de todos os meses já passados pelo sistema
- **PDF S-140 mais fiel**: evoluir o renderer `@react-pdf/renderer` atual para espelhar estrutura, numeração, durações, cânticos e layout tabular do `S-140.docx` (uma página por semana)
- **Adicionar parte contextual**: botão `+` nas seções FSM e NVC abrindo modal com seção pré-selecionada
- **Reordenar partes**: arrastar partes FSM e NVC (exceto estudo bíblico) dentro da semana

## Capabilities

### New Capabilities

- (nenhuma — extensões dentro das capabilities existentes)

### Modified Capabilities

- `assignment-schedule`: horizonte de meses, listagem com status, hub de navegação, modal de adicionar parte, reordenação por drag
- `s140-pdf-export`: layout fiel ao `S-140.docx`
- `pwa-shell`: sub-abas na página Histórico

## Impact

- **API** (`apps/api/src/schedule/`): `GET /schedule/months`, `POST /schedule/horizon/ensure`, `PATCH /schedule/weeks/:weekId/parts/reorder`
- **Web** (`apps/web/src/app/(app)/schedule/`, `history/`): hub de meses, sub-abas, modal, drag-and-drop
- **PDF** (`apps/api/src/pdf/`): reescrita visual de `s140-document.tsx` e enriquecimento de `s140-model.ts`
- **Dependência nova**: `@dnd-kit/core` + `@dnd-kit/sortable` no web app
- **Sem migration Prisma** — `sortOrder` já existe; durações S-140 via mapa estático por `partType.code`

## Non-Goals

- Preencher ou exportar DOCX (permanece PDF via react-pdf)
- Preencher números de cânticos ou leitura semanal da Bíblia (permanecem como placeholder no PDF)
- Reordenar partes de Tesouros, fora de tópico ou estudo bíblico
- Alterar regras de elegibilidade de designação
