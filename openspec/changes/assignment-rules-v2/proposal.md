## Why

O motor de designação atual usa contadores por papel (TITULAR, LEITOR, etc.) que não refletem como a congregação pensa em equilibrar partes (Presidente, Oração, Titular, Ministério). O picker mostra um único número ambíguo, a ordenação é alfabética, e o alerta de repetição no mês para participantes femininas falha na UX (input vazio sem confirmação visível no slot).

Também faltam: flag **Qualificado** para batizados em orações/leitor, navegação entre semanas do mesmo mês, e compartilhamento via WhatsApp na tela da semana.

## What Changes

- **Campo `qualified`** em participante (checkbox, default `false`; visível só quando privilégio = Batizado)
- **Privilégio padrão** no cadastro: Batizado (em vez de Publicador)
- **Elegibilidade**: oração inicial/final e leitor do livro — Ancião, Servo Ministerial, Batizado qualificado; dirigente do livro — Ancião e SM
- **Nova taxonomia de contagem** com recálculo do histórico:
  - Presidente, Oração (inicial+final), Titular, Dirigente, Ajudante, Ministério (Leitura Bíblia + FSM, só homens)
  - Leitor do livro conta como Titular; Leitura Bíblia e FSM contam como Ministério (não Titular)
- **Picker enriquecido**: tabelinha compacta Este mês / Total; colunas só com valor > 0; categoria da designação em aberto à esquerda
- **Ordenação do picker**: menor contagem da categoria relevante; participantes já designados na semana ao final
- **Alerta feminino no mês**: sempre na 2ª+ designação do mês (qualquer privilégio); confirmação **inline no slot**
- **WhatsApp** ao lado de Sugerir/Limpar quando há telefone; normalização para `wa.me`
- **Navegação de semanas** (dentro do mês): botões no final da página; swipe lateral só touch; sem avançar na última semana nem voltar na primeira

## Capabilities

### New Capabilities

- (nenhuma — extensões dentro de `participants` e `assignment-schedule`)

### Modified Capabilities

- `participants`: campo `qualified`, default Batizado, exibição do checkbox
- `assignment-schedule`: contadores, elegibilidade, picker, alertas, WhatsApp, navegação semanal

## Impact

- **Schema** (`packages/database/prisma/schema.prisma`): `Participant.qualified`, novos campos de contagem (`presidenteCount`, `oracaoCount`, `ministerioCount`); migration + script de recálculo
- **API** (`apps/api/src/schedule/`, `participants/`): regras, elegibilidade, endpoint enriched, soft alert feminino
- **Shared** (`packages/shared/`): tipos e enums exportados
- **Web** (`participant-picker.tsx`, `weeks/[weekId]/page.tsx`, `participant-form.tsx`): UI de contadores, confirmação inline, WhatsApp, navegação
- **Seed**: privilégios de oração/leitor ajustados; lógica qualificado em runtime

## Non-Goals

- Navegação entre meses (última semana do mês não tem “próxima”)
- Swipe em desktop (mouse)
- WhatsApp no picker dropdown
- Alterar limite de 1 parte/semana para mulheres
- Import de temas ou mudanças no PDF S-140
