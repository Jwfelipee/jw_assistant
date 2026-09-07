# Task 4 — S-140 PDF fidelity

**Change:** `assignment-schedule-v2`  
**Grupo:** 4 de 6  
**Pré-requisitos:** (nenhum — paralelo com 2/3)  
**Desbloqueia:** export visual aceitável para congregação

## Objetivo do grupo

Reescrever o PDF S-140 para espelhar fielmente a estrutura do `S-140.docx` usando `@react-pdf/renderer` existente.

## Contexto para o subagent

- Referência: `S-140.docx` na root do repo — extrair texto com `unzip -p S-140.docx word/document.xml`
- Renderer atual: `apps/api/src/pdf/s140-document.tsx` — **uma página A4 com todas as semanas**
- Model: `apps/api/src/pdf/s140-model.ts` — `buildS140DocumentData()`
- Types: `apps/api/src/pdf/s140.types.ts`
- Service: `apps/api/src/pdf/s140-pdf.service.ts` — não mudar endpoint
- Testes: `apps/api/src/pdf/s140-model.spec.ts`
- Part types **não** têm campo duration — usar mapa estático por `partTypeCode`

### Gaps docx vs atual (checklist de implementação)

| Elemento | Implementar |
|----------|---------------|
| 1 página por semana | `<Page>` por week |
| Cabeçalho congregação centralizado | manter, por página |
| `[DATA] \| LEITURA SEMANAL DA BÍBLIA` | `dd/MM/yyyy \| LEITURA SEMANAL DA BÍBLIA` |
| Presidente / Oração inicial | linha tabular |
| Cântico [número] (abertura) | placeholder fixo |
| Comentários iniciais (1 min) | linha com nome placeholder |
| TESOUROS + Salão principal | header seção + sublabel |
| Partes 1–3 com duração | `1. Tema (10 min)` + nome à direita |
| FSM 4–7 com duração e par | numeração + `(X min)` |
| NVC cântico + 8–9 | estrutura igual docx |
| Estudo 10 + Dirigente/leitor | label explícito |
| Comentários finais (3 min) | linha fixa |
| Cântico + Oração final | placeholders |
| Coluna `0:00` | coluna direita em cada linha de parte |

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/pdf/s140.types.ts` | editar |
| `apps/api/src/pdf/s140-model.ts` | editar |
| `apps/api/src/pdf/s140-document.tsx` | editar (reescrita) |
| `apps/api/src/pdf/s140-model.spec.ts` | editar |

---

## 4.1 — Enriched model

### O que fazer

Expandir types:

```typescript
export type S140PartLine = {
  number: number | null;      // 1-10 or null for non-numbered
  title: string;              // "Tema" text with label
  duration: string | null;    // "10 min", "X min"
  assignee: string;
  studyPair?: boolean;
  showDirectorLabel?: boolean;
};

export type S140WeekView = {
  meetingDateShort: string;   // dd/MM/yyyy
  president: string;
  openingPrayer: string;
  closingPrayer: string;
  openingSong: string;        // "Cântico [número]"
  closingSong: string;
  openingComments: string;    // placeholder name
  closingComments: string;
  treasures: S140PartLine[];
  ministry: S140PartLine[];
  christianLife: S140PartLine[];
  study: S140PartLine | null;
  nvcSong: string;
};
```

Em `buildS140DocumentData`:
- Atribuir números sequenciais: tesouros 1–3, FSM a partir de 4, NVC 8–9 (ajustar se FSM extras), estudo 10
- Mapa durações:

```typescript
const DURATION_BY_CODE: Record<string, string> = {
  TESOUROS: '10 min',
  JOIAS: '10 min',
  LEITURA_BIBLIA: '4 min',
  ESTUDO_BIBLICO: '30 min',
};
// default FSM: 'X min', NVC: 'XX min'
```

- `formatMeetingDateShort(iso)` → `dd/MM/yyyy` UTC

### Critérios de aceite

- [ ] Numeração correta com FSM extras (4,5,6,7… antes de NVC)
- [ ] Estudo sempre número 10
- [ ] Testes unitários atualizados

---

## 4.2 — Rewrite s140-document.tsx

### O que fazer

1. **Uma `<Page size="A4">` por semana** com header congregação repetido
2. Layout tabular com `flexDirection: 'row'`:
   - Coluna esquerda (~70%): título/número
   - Coluna direita: assignee + `0:00`
3. Section headers com cores próximas ao docx (tons discretos, não exato)
4. Linhas fixas (não vêm do banco):
   - Cântico abertura, Comentários iniciais (1 min)
   - Cântico NVC (antes das partes NVC numeradas)
   - Comentários finais (3 min), Cântico fechamento
5. Fonte: Helvetica (react-pdf default) — aceitável
6. `wrap={false}` em blocos de semana para evitar quebra no meio

### Critérios de aceite

- [ ] PDF com N páginas = N semanas do mês
- [ ] Estrutura visual reconhecível vs `S-140.docx`
- [ ] Pares `Nome/Nome` e estudo `Dirigente/leitor:` mantidos

### Não fazer

- Não adicionar LibreOffice ou docx
- Não buscar cânticos reais de API externa

---

## 4.3 — Tests

### O que fazer

Atualizar `s140-model.spec.ts`:
- Verificar numbering com semana de seed
- Verificar `meetingDateShort` format
- Verificar study = number 10

### Critérios de aceite

- [ ] `pnpm --filter api test` passa

---

## 4.4 — Visual verification

### O que fazer

1. Subir API com seed
2. `GET /schedule/months/2026-09/s140.pdf` (ou mês do seed)
3. Comparar lado a lado com `S-140.docx` impresso/aberto
4. Documentar no PR quais diferenças residuais permanecem (fontes Word vs Helvetica)

### Critérios de aceite

- [ ] PDF revisado manualmente
- [ ] Checklist de gaps do design.md endereçado

---

## Verificação do grupo

```bash
curl -b cookies.txt -o /tmp/s140.pdf http://localhost:3001/schedule/months/2026-09/s140.pdf
```

Abrir PDF e comparar com S-140.docx.

## Handoff para próxima task

Export PDF reflete `sortOrder` — task 6 (reorder) afeta ordem no PDF automaticamente.
