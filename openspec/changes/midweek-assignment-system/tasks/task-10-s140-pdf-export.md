# Task 10 — S-140 PDF export

**Change:** `midweek-assignment-system`  
**Grupo:** 10 of 11  
**Pré-requisitos:** [8. Schedule engine](./task-08-assignment-schedule-engine-and-api.md), [4. Settings](./task-04-congregation-settings.md)  
**Desbloqueia:** ação de download na UI do mês

## Objetivo do grupo

Gerar e baixar PDF S-140 de um mês completo, alinhado a `S-140.docx`.

## Contexto para o subagent

- Spec: `../specs/s140-pdf-export/spec.md`
- Referência visual/estrutura: `S-140.docx` na root do repo.
- Incluir: nome congregação, datas, presidente, orações, 3 tópicos, pares Nome/Nome, Dirigente/leitor.
- Design D8: `@react-pdf/renderer` ou HTML→PDF; preferir solução server-side no Nest.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/pdf/**` | criar |
| `apps/web` botão export no mês | editar |

---

## 10.1 — PDF renderer

### O que fazer

- Montar documento com todas as semanas do mês (ordem por meetingDate/weekStart).
- Placeholders para slots vazios.
- Nome arquivo sugerido: `S-140-YYYY-MM.pdf`.

### Critérios de aceite

- [ ] PDF contém todas as semanas do mês
- [ ] Pares e estudo renderizam dois nomes
- [ ] Nome da congregação e meetingDates corretos

### Não fazer

- Não exigir DOCX export
- Não buscar dados oficiais JW.org

---

## 10.2 — Endpoint + UI action

### O que fazer

- `GET /schedule/months/:yearMonth/s140.pdf` (auth required, `Content-Type: application/pdf`).
- Botão “Exportar S-140” na visão do mês.

### Critérios de aceite

- [ ] Download funciona em mobile e desktop browser
- [ ] Sem auth → 401

### Não fazer

- Não armazenar PDF em disco permanentemente (gerar on-the-fly ok)

---

## Verificação do grupo

Exportar mês com dados de seed/fixture e revisar visualmente contra S-140.

## Handoff para próxima task

Export pronto; falta polish PWA/nav.
