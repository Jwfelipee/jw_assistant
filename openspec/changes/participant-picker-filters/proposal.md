## Why

Na tela da semana, o `ParticipantPicker` só filtra por **nome**. Coordenadores precisam restringir a lista por **sexo**, **privilégio** e por quem teve a **última designação global** em um **papel** específico (ex.: última foi Ajudante), sem sair do fluxo de designar ao selecionar.

Também falta contexto rápido: ver as designações recentes de cada pessoa **dentro do dropdown**, em um painel compacto com scroll, sem inflar a altura da lista inteira.

## What Changes

- **API:** cada item em `eligible` inclui `lastAssignment` (designação global mais recente: data, papel, tipo de parte, tópico)
- **Picker — filtros:** sexo, privilégio, “última designação foi” (papel); aplicados no cliente sobre a lista elegível
- **Estado dos filtros:** chaveado por `slotId` — ao abrir outro slot, filtros **zeram**; ao reabrir o **mesmo** slot, **restaura** o último estado; botão **Limpar filtros**
- **Picker — histórico inline:** por participante, botão/área para abrir uma **caixa fixa** (~3 linhas visíveis) com scroll **interno** listando designações em uma linha (estilo Histórico); carregamento lazy via `GET /participants/:id/assignments` (ou history com `participantId`)
- Clique na linha principal continua **designando**; controles de filtro/histórico não disparam assign (`stopPropagation`)

## Capabilities

### New Capabilities

- (nenhuma)

### Modified Capabilities

- `assignment-schedule`: picker com filtros contextuais, última designação no payload de elegíveis, mini-histórico no dropdown

## Impact

- **API** `apps/api/src/schedule/schedule.service.ts` — `getEligibleParticipants`
- **Web** `apps/web/src/components/participant-picker.tsx`, tipos em `apps/web/src/lib/schedule.ts`
- **Sem migration** Prisma

## Non-Goals

- Alterar regras de elegibilidade hard
- Mostrar inelegíveis ocultos por sexo/privilégio
- Filtro por tipo de parte na “última designação” (só **papel** na v1)
- Persistir filtros entre sessões ou entre semanas (só por slot enquanto na página)
