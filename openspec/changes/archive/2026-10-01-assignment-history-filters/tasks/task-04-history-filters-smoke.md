# Task 4 — History filters smoke

**Change:** `assignment-history-filters`  
**Grupo:** 4 de 4  
**Pré-requisitos:** [task-02](./task-02-history-api-tests.md), [task-03](./task-03-history-filters-ui.md)  
**Desbloqueia:** —

## Objetivo do grupo

Validar end-to-end no browser os fluxos principais de coordenação descritos na change.

## Contexto para o subagent

- Stack Docker ou `pnpm` dev conforme README do monorepo
- Login seed admin
- Dados: pelo menos 2 participantes (M/F), histórico com Joias e Estudo em datas distintas

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| (nenhum obrigatório) | — |

---

## 4.1 — Smoke sex + designação + última no período

### O que fazer

1. `/history` → aba Por designação
2. Designação **Joias espirituais**, Sexo **Mulheres**, período que inclua 2+ designações da mesma irmã
3. Marcar **Apenas a última designação de cada participante** → Filtrar
4. Confirmar: uma linha por irmã; data = mais recente **dentro** do período; ordem decrescente

### Critérios de aceite

- [ ] Contagem `total` coerente com participantes únicos
- [ ] Captura de tela ou gravação curta em `/opt/cursor/artifacts/` se política do agente exigir

---

## 4.2 — Smoke Estudo e paginação

### O que fazer

1. Designação **Estudo bíblico de congregação**
2. Testar **Dirigente**, **Leitor**, **Dirigente e leitor**
3. Se `total > 20`, navegar **Próxima** página sem perder filtros

### Critérios de aceite

- [ ] Cada papel retorna conjunto esperado
- [ ] **Todas as designações** + última por participante funciona só com sexo/período (sem designação)

---

## Verificação do grupo

Checklist acima completo; testes automatizados da task-02 verdes.

## Handoff

Change pronta para archive (`openspec-archive-change`) após merge.
