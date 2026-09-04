## Context

Greenfield: o repositório contém apenas scaffolding OpenSpec e a referência `S-140.docx`. O produto é um assistente interno de uma única congregação para programar a reunião do meio de semana — participantes não acessam a plataforma; um único usuário autentica-se e opera o sistema.

Stack alvo: monorepo com Next.js (PWA mobile-first), NestJS, PostgreSQL e Prisma. Domínio centrado em participantes, ausências, catálogo de tipos de parte, calendário Bimestre→Mês→Semana e exportação PDF no formato S-140.

## Goals / Non-Goals

**Goals:**

- Entregar monorepo operacional com UI PWA e API Nest
- Modelar e aplicar as regras de negócio de participantes, designações, ausências e configurações
- Gerar skeleton semanal alinhado ao S-140 (Tesouros fixo, FSM/NVC configuráveis, partes fora de tópico)
- Sugerir titulares/ajudantes pelo menor contador do papel
- Exportar PDF S-140 por mês, com datas derivadas do dia da semana configurado
- UX mobile-first com bottom navigation

**Non-Goals:**

- Multi-tenant / multi-congregação
- Contas ou login para participantes
- Importação da Apostila/Workbook (apenas extensão futura)
- Sincronização com jw.org ou apps oficiais
- Notificações push para participantes

## Decisions

### D1 — Estrutura do monorepo (Turborepo + pnpm)

- `apps/web` — Next.js App Router, PWA (`@ducanh2912/next-pwa` ou equivalente)
- `apps/api` — NestJS (REST)
- `packages/database` — Prisma schema, client, migrations
- `packages/shared` — enums, DTOs Zod/tipos compartilhados, constantes de domínio

**Alternatives:** Nx (mais pesado para time de 1); monólito Next com Route Handlers (mistura domínio de designação com UI e dificulta jobs/PDF).

### D2 — Auth single-user

Um usuário seedado via env (`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`). Sessão com cookie httpOnly (JWT ou session token) emitido pelo Nest; Next usa BFF/proxy ou chama API com credentials.

**Alternatives:** Auth.js multi-provider (overkill); sem auth (inaceitável mesmo para uso interno se a app for acessível na rede).

### D3 — Modelo de calendário e pertencimento da semana

```
Bimester (year + index 1..6)  // Jan-Fev=1, Mar-Abr=2, ...
  └── Month (year-month)
        └── Week (weekStartDate = segunda da semana ISO ou domingo→sábado?
                   meetingDate = dia configurado dentro da semana)
```

**Regra de inclusão no mês:** a semana pertence ao mês em que **inicia** (`weekStartDate`).  
**DATA no S-140:** `meetingDate` = data do dia da semana configurado (ex.: quinta) dentro daquela semana.  
Config `CongregationSettings.meetingWeekday` (0–6 ou enum `MONDAY`…`SUNDAY`).

Ao abrir “próximo mês sem designações”, o sistema cria (se não existir) bimestre/mês e N semanas cujas `weekStartDate` caem naquele mês civil, cada uma com partes template.

**Alternatives:** semana = “quinta a quinta” (mais confuso para calendário civil); usuário cria semanas manualmente (mais erro-prone).

### D4 — Catálogo de tipos de parte vs. instâncias

Separar:

| Conceito | Uso |
|----------|-----|
| `PartType` / `AssignmentTemplate` | Regras reutilizáveis (tópico, sexo permitido, slots 1\|2, papéis, privilégios aptos, se é removível, se entra na contagem “separada”) |
| `WeekPart` | Instância na semana (tema livre digitado, ordem, FK ao tipo) |
| `AssignmentSlot` | Papel na parte (TITULAR, AJUDANTE, DIRIGENTE, LEITOR) + participante opcional |

FSM: cadastro de tipos pelo usuário (sexo, 1 ou 2 participantes). Seed inicial com 3 tipos genéricos.  
Tesouros / Presidente / Orações / Estudo bíblico: tipos seed imutáveis (ou `isSystem=true`).  
NVC: tipos adicionáveis + tipo sistema “Estudo bíblico de congregação” sempre por último.

Contagem **separada** (`ministryPracticeCount`): incrementa em partes FSM **e** em *Leitura da Bíblia*; contadores por papel (`titularCount`, etc.) sempre incrementam no papel atribuído; partes de 1 participante usam papel `TITULAR` por padrão (exceto DIRIGENTE/LEITOR do estudo).

### D5 — Privilégios

Enum / tabela:

| Código | Sexo |
|--------|------|
| `ELDER` (Ancião) | M |
| `MINISTERIAL_SERVANT` (Servo Ministerial) | M |
| `REGULAR_PIONEER` (Pioneiro Regular) | M |
| `REGULAR_PIONEER_SISTER` (Pioneira Regular) | F |
| `BAPTIZED` (Batizado) | ambos |
| `PUBLISHER` (Publicador / publicadora não batizada) | ambos |

Participante guarda **um privilégio principal** para filtros de alerta/elegibilidade (hierarquia implícita na validação: Ancião/SM satisfazem partes que pedem Ancião|SM). Preferência de papel: `ANY` \| `PRINCIPAL_ONLY` (titular/dirigente) \| `ASSISTANT_ONLY` (ajudante/leitor conforme contexto).

### D6 — Motor de elegibilidade e sugestão (domínio no Nest)

Pacote de serviços em `apps/api` (ou `packages/shared` puro + orquestração Nest):

1. Filtrar por sexo, privilégios do `PartType`, preferência de papel
2. Excluir ausência indeterminada; excluir ausência com fim se a `meetingDate` ∈ [start, end]
3. Incluir quem está ausente até data D se a designação é **depois** de D (RN 03.1), mesmo sem “reativar”
4. Mulheres: no máximo 1 designação na mesma semana
5. Ordenar candidatos por contador do papel alvo (ASC), depois nome
6. Alertas soft (não bloqueiam salvo config futura):
   - repetiu designação no **mês** — configurável por privilégio
   - par misto de sexo — silenciado se existir `ParticipantAssociation` ativa

### D7 — Ausências

`Absence`: `participantId`, `startsOn`, `endsOn` nullable, `justification` (nunca retornada em listagens; endpoint/campo só com flag `revealJustification=true`), `status` (`ACTIVE`/`ENDED`/`CANCELLED`).

Job diário (Nest cron ou ao carregar dashboard): se `endsOn < today` e ainda não reconhecido → alerta “ausência encerrada” pedindo reativar ou novo período. Ausência sem `endsOn`: participante some de **todas** as listas de designação (sem override).

### D8 — PDF S-140

Biblioteca: `@react-pdf/renderer` no Nest (ou Playwright print de HTML). Layout fiel ao `S-140.docx` por mês (todas as semanas do mês). Endpoint `GET /months/:yearMonth/s140.pdf`. Nome da congregação e datas vêm de settings + `meetingDate`.

**Alternatives:** só impressão browser (menos confiável no mobile); DOCX (usuário pediu PDF).

### D9 — UI / navegação

Bottom nav: Início | Participantes | Designações | Histórico (ícones; a partir de `sm`/`md` mostra label). Tema e tipografia definidos no web app; componentes acessíveis. Início destaca **próximo mês** sem programação completa + alertas de ausência.

### D10 — Prisma como fonte da verdade do schema

Migrations versionadas em `packages/database`. API e (se necessário) scripts usam o mesmo client. Seed: usuário admin, settings default, part types de sistema, 3 FSM default, 2 NVC default + estudo.

## Risks / Trade-offs

- **[Risco] Layout PDF divergir do S-140 oficial** → Mitigation: espelhar estrutura do `S-140.docx`; revisão visual com amostra real; manter template HTML/PDF versionado
- **[Risco] Definição de “início da semana” ambígua (domingo vs segunda)** → Mitigation: fixar `weekStart` como segunda (ISO) no design; `meetingDate` independente via weekday config; documentar no settings
- **[Risco] Contadores divergirem após edições/remoções** → Mitigation: recalcular a partir do histórico ou transação que decrementa no unassign
- **[Risco] PWA + auth cookie em device compartilhado** → Mitigation: logout claro; session TTL; uso interno consciente
- **[Trade-off] Temas digitados manualmente** → Aceito até haver import de Apostila
- **[Trade-off] Um único usuário** → Simplifica auth; sem auditoria multi-operador

## Migration Plan

1. Bootstrap monorepo + Postgres local (Docker Compose)
2. Prisma schema + seed
3. Auth + settings
4. Participantes / ausências
5. Catálogo + schedule engine
6. UI fluxos principais
7. PDF export
8. PWA polish

Rollback: greenfield — dropar DB / reverter migrations; sem dados legados.

## Open Questions

- Definição canônica do início da semana: **segunda (ISO)** adotada neste design; confirmar se a congregação prefere domingo.
- Duração da sessão / política de “lembrar-me” no dispositivo.
- Idioma da UI: **pt-BR** (assumido).
)
