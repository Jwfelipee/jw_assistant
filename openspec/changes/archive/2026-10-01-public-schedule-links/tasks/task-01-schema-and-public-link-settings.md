# Task 1 — Schema and public link settings

**Change:** `public-schedule-links`
**Grupo:** 1 de 5
**Pré-requisitos:** (nenhum)
**Desbloqueia:** [3. Public schedule API](./task-03-public-schedule-api.md), [5. Settings UI](./task-05-settings-public-links-ui.md)

## Objetivo do grupo

Persistir os quatro toggles de habilitação de links públicos em `CongregationSettings` e expô-los via API/web settings existente.

## Contexto para o subagent

- Schema: `packages/database/prisma/schema.prisma` — model `CongregationSettings` (singleton `id = 1`)
- Settings API: `apps/api/src/settings/settings.service.ts`, `settings.controller.ts`, `dto/update-settings.dto.ts`
- Web types: `apps/web/src/lib/settings.ts`, form em `settings-form.tsx`
- Convenção: campos Prisma em camelCase; API response usa `congregationName` (mapeado de `name`)
- **Não alterar** auth, schedule assign, ou outras settings nesta task

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `packages/database/prisma/schema.prisma` | editar |
| `packages/database/prisma/migrations/<timestamp>_public_link_toggles/migration.sql` | criar |
| `apps/api/src/settings/settings.service.ts` | editar |
| `apps/api/src/settings/dto/update-settings.dto.ts` | editar |
| `apps/api/src/settings/dto/update-settings.dto.spec.ts` | editar |
| `apps/web/src/lib/settings.ts` | editar |

---

## 1.1 — Prisma schema + migration

### O que fazer

Adicionar ao model `CongregationSettings`:

```prisma
publicLinkCurrentWeekEnabled  Boolean @default(true)
publicLinkNextWeekEnabled     Boolean @default(true)
publicLinkCurrentMonthEnabled Boolean @default(true)
publicLinkNextMonthEnabled    Boolean @default(true)
```

Rodar migration:

```bash
cd packages/database && pnpm prisma migrate dev --name public_link_toggles
```

Atualizar seed se existir upsert de `CongregationSettings` (não precisa setar explicitamente — defaults cobrem).

### Critérios de aceite

- [ ] Migration aplicada sem erro
- [ ] Registro existente `id = 1` recebe os quatro campos como `true`

### Não fazer

- Não criar tabela separada para links
- Não adicionar slug/token

---

## 1.2 — Settings API

### O que fazer

**`SettingsResponse`** — adicionar:

```typescript
publicLinkCurrentWeekEnabled: boolean;
publicLinkNextWeekEnabled: boolean;
publicLinkCurrentMonthEnabled: boolean;
publicLinkNextMonthEnabled: boolean;
```

**`UpdateSettingsDto`** — campos opcionais com `@IsBoolean()`:

```typescript
@IsOptional()
@IsBoolean()
publicLinkCurrentWeekEnabled?: boolean;
// ... demais
```

**`SettingsService.get()`** — retornar os quatro flags do Prisma.

**`SettingsService.update()`** — aplicar apenas campos presentes no DTO (partial update dos toggles permitido sem reenviar nome).

Manter validação existente: `congregationName` obrigatório quando enviado no PATCH completo. Para toggles isolados, aceitar PATCH com só os booleans (ajustar DTO para `congregationName` opcional quando outros campos presentes, ou criar endpoint separado `PATCH /settings/public-links` — preferir tornar `congregationName` opcional no PATCH e só atualizar campos enviados).

### Critérios de aceite

- [ ] `GET /settings` retorna os quatro flags
- [ ] `PATCH /settings` com `{ publicLinkCurrentWeekEnabled: false }` persiste sem exigir nome
- [ ] Sem auth → 401

### Não fazer

- Não expor toggles em endpoint público

---

## 1.3 — Web types

### O que fazer

Atualizar `CongregationSettings` em `apps/web/src/lib/settings.ts`:

```typescript
export type CongregationSettings = {
  congregationName: string;
  meetingWeekday: Weekday;
  publicLinkCurrentWeekEnabled: boolean;
  publicLinkNextWeekEnabled: boolean;
  publicLinkCurrentMonthEnabled: boolean;
  publicLinkNextMonthEnabled: boolean;
};
```

`updateSettingsRequest` já envia o payload completo — task 5 cuidará da UI; aqui garantir que o tipo aceita os novos campos.

### Critérios de aceite

- [ ] TypeScript compila com novos campos
- [ ] `fetchSettings()` parseia resposta corretamente

### Não fazer

- Não implementar UI de toggles nesta task (task 5)

---

## 1.4 — Tests

### O que fazer

Em `update-settings.dto.spec.ts` (ou spec do service):

- Validar DTO aceita booleans
- Validar defaults quando omitidos

### Critérios de aceite

- [ ] Testes passam (`pnpm --filter api test`)

### Não fazer

- Não testar páginas públicas aqui

---

## Verificação do grupo

```bash
pnpm --filter database prisma migrate deploy
pnpm --filter api test -- settings
curl -b cookie.txt http://localhost:3001/settings  # deve incluir os 4 flags
```

## Handoff para próxima task

API de settings retorna flags; Prisma tem colunas. Task 3 usará `publicLinkCurrentWeekEnabled` etc. para gate dos endpoints públicos.
