## Why

A tela de designação da semana exige passos desnecessários (selecionar participante **e** clicar em Designar), não filtra participantes por elegibilidade antes da escolha, não permite editar temas de partes já criadas e usa um `<select>` nativo inadequado para congregações com 70+ participantes.

Isso torna a programação semanal mais lenta e frustrante, com erros descobertos só após tentar designar.

## What Changes

- **Designar ao selecionar**: escolher um participante no picker já dispara a designação (mantendo fluxo de confirmação para alertas soft)
- **Sugerir designa imediatamente**: botão Sugerir atribui o participante sugerido e permite trocar ou pedir outra sugestão
- **Lista filtrada por elegibilidade**: novo endpoint `GET /slots/:id/eligible-participants` retorna participantes elegíveis e inelegíveis categorizados
  - Ocultar totalmente inelegíveis por sexo, privilégio ou preferência de papel
  - Mostrar ao final da lista (cinza, não selecionável) inelegíveis por ausência ou limite semanal de mulher
- **Picker com busca**: componente `ParticipantPicker` (combobox) com digitação para filtrar por nome
- **Editar tema de partes existentes**: `PATCH /schedule/parts/:partId` + edição inline na tela da semana
- Remover botão **Designar** (ação implícita na seleção)

## Capabilities

### New Capabilities

- (nenhuma — melhorias dentro de `assignment-schedule`)

### Modified Capabilities

- `assignment-schedule`: UX de designação, endpoint de elegibilidade, edição de tema, sugestão com assign imediato

## Impact

- **API** (`apps/api/src/schedule/`): novos endpoints, refatoração da lógica de elegibilidade compartilhada com `suggest`
- **Web** (`apps/web/src/app/(app)/schedule/`): substituir `<select>` por `ParticipantPicker`, auto-assign, edição de tema inline
- **Sem mudanças de schema** Prisma — `WeekPart.title` já existe
- Congregações com 70+ participantes: endpoint dedicado evita payload pesado e garante regras corretas (ausências, limite feminino)

## Non-Goals

- Alterar regras de negócio de elegibilidade (sexo, privilégio, ausência, etc.)
- Import de temas da Apostila
- Combobox genérico reutilizável fora de designações
- Mostrar participantes inelegíveis por sexo/privilégio/preferência (permanecem ocultos)
