## Why

A programação da reunião do meio de semana (formulário S-140) é feita manualmente, o que torna difícil equilibrar designações, respeitar privilégios/sexo, ausências e histórico. Precisamos de um assistente interno da congregação — PWA mobile-first com API — que automatize a estrutura semanal, sugira participantes com justiça e exporte o S-140 em PDF por mês.

## What Changes

- Criar monorepo com **Next.js (PWA)**, **NestJS**, **PostgreSQL** e **Prisma**
- Autenticação para **um único usuário** da congregação (sem multi-tenant)
- Cadastro de **participantes** (sem acesso à plataforma): nome, telefone opcional, sexo, privilégios, preferências de papel, associações de pares
- Gerenciamento de **designações** por Bimestre → Mês → Semana → Partes, com templates padrão alinhados ao S-140
- Cadastro configurável de **tipos de parte** do tópico *Faça Seu Melhor no Ministério* (sexo permitido, 1 ou 2 participantes)
- Regras de elegibilidade, alertas (repetição no mês, par misto), sugestão por menor contagem de papel
- Contadores por papel (titular/ajudante/dirigente/leitor) e contagem **separada** para *Faça Seu Melhor* + *Leitura da Bíblia*
- Sistema de **ausências** (com ou sem data fim), histórico e alertas de retorno
- Configurações da congregação: **nome** e **dia da semana** usado para preencher a `[DATA]` de cada semana
- Inclusão de semanas no mês com base no **calendário** (semana pertence ao mês em que inicia)
- Exportação **PDF do S-140 por mês**
- UI mobile-first com navegação inferior (ícones; labels em telas maiores)

## Capabilities

### New Capabilities

- `auth-single-user`: autenticação e sessão do único usuário da congregação
- `congregation-settings`: nome da congregação e dia base da reunião para datas do S-140
- `participants`: cadastro, privilégios, preferências, associações e contadores
- `absences`: períodos de ausência, reativação, histórico e justificativa oculta
- `assignment-catalog`: tipos/templates de partes (Tesouros, FSM, Nossa Vida Cristã, fora de tópico)
- `assignment-schedule`: calendário bimestre/mês/semana, designações, alertas, sugestões e histórico
- `s140-pdf-export`: geração e download do PDF S-140 por mês
- `pwa-shell`: shell Next PWA, layout responsivo e navegação inferior

### Modified Capabilities

- (nenhuma — repositório greenfield)

## Impact

- Repositório passa de vazio para monorepo completo (`apps/web`, `apps/api`, `packages/database`, `packages/shared`)
- Novas dependências: Next.js, NestJS, Prisma, PostgreSQL, gerador de PDF, PWA tooling
- Domínio alinhado ao formulário oficial S-140 (referência: `S-140.docx`)
- Fora de escopo agora: multi-tenant, import da Apostila/Workbook, acesso de participantes à plataforma
)
