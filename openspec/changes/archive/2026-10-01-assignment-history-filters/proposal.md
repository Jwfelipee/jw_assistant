## Why

Coordenadores usam o histórico para **rotação justa** (“quem foi o último em Joias?”, “irmãs que fizeram FSM titular”). A busca atual lista **todas** as ocorrências e só filtra por tópico amplo e papel genérico — não por **sexo**, nem por **tipo de parte** (Presidente, Oração inicial, Joias, tipos NVC do catálogo, etc.), nem por modo “**uma linha por participante**” (última designação no filtro).

## What Changes

- **Filtro por sexo** do participante (todos, masculino, feminino)
- **Filtro por designação** via catálogo: um item por `PartType` no dropdown + opção “Todas as designações”
- **Papel no Estudo bíblico**: filtrar só Dirigente, só Leitor, ou ambos os papéis (OR)
- **Modo “última por participante”** (toggle independente): no máximo uma linha por participante; quando há período **de/até**, a “última” é a mais recente **dentro do intervalo**; ordenação da lista permanece por data da reunião decrescente (como hoje)
- **API** `GET /assignments/history`: novos query params; ramo de agregação com `DISTINCT ON` no Postgres quando o modo estiver ativo
- **Web** (`AssignmentHistoryView`): novos controles; substituir filtro só por tópico por seletor de designação (agrupado por bloco da reunião)

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `assignment-schedule`: requisitos e comportamento da busca de histórico por designação

## Impact

- **API** (`apps/api/src/schedule/`): `HistoryQueryDto`, `schedule.service.history`
- **Web** (`apps/web/src/components/assignment-history-view.tsx`, `apps/web/src/lib/schedule.ts`): tipos e UI; catálogo `GET /catalog/part-types` para popular dropdown
- **Sem mudança de schema** Prisma

## Non-Goals

- Histórico “quem nunca fez X” (lista de elegíveis sem designação)
- Exportar CSV/PDF do histórico filtrado
- Alterar aba “Por mês” do Histórico
- Filtro por título livre da parte (`weekPart.title`) em vez do tipo do catálogo
