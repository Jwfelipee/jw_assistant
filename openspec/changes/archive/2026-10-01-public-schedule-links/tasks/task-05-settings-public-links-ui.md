# Task 5 — Settings UI for public links

**Change:** `public-schedule-links`
**Grupo:** 5 de 5
**Pré-requisitos:** [1. Schema and settings](./task-01-schema-and-public-link-settings.md), [3. Public schedule API](./task-03-public-schedule-api.md) (para validar disable)
**Desbloqueia:** (nenhum)

## Objetivo do grupo

Adicionar seção "Links públicos" em Configurações com URL copiável e toggle ativo/inativo por link.

## Contexto para o subagent

- Settings page: `apps/web/src/app/(app)/settings/page.tsx`
- Form existente: `settings-form.tsx` — nome + dia da reunião
- API: `PATCH /settings` aceita os quatro booleans (task 1)
- Paths fixos:
  - `/esta-semana` → `publicLinkCurrentWeekEnabled`
  - `/proxima-semana` → `publicLinkNextWeekEnabled`
  - `/este-mes` → `publicLinkCurrentMonthEnabled`
  - `/proximo-mes` → `publicLinkNextMonthEnabled`
- Padrão UI: `sectionCardClass`, `btnOutline`, tokens CSS existentes
- Clipboard: `navigator.clipboard.writeText(url)` com fallback `execCommand` se necessário

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web/src/components/public-links-section.tsx` | criar |
| `apps/web/src/app/(app)/settings/page.tsx` | editar |
| `apps/web/src/app/(app)/settings/settings-form.tsx` | editar (opcional — pode manter seção separada) |

---

## 5.1 — PublicLinksSection component

### O que fazer

Props:

```typescript
type Props = {
  settings: CongregationSettings;
  onUpdate: (patch: Partial<CongregationSettings>) => Promise<void>;
};
```

Config estática:

```typescript
const PUBLIC_LINKS = [
  {
    key: 'publicLinkCurrentWeekEnabled' as const,
    label: 'Esta semana',
    path: '/esta-semana',
    description: 'Designações da semana atual',
  },
  // ... demais
];
```

Por linha:

```
┌─────────────────────────────────────────────────────┐
│ Esta semana                                         │
│ Designações da semana atual                         │
│ ┌─────────────────────────────────────┐ [Copiar]    │
│ │ https://example.com/esta-semana     │             │
│ └─────────────────────────────────────┘             │
│ Ativo  [switch]                                     │
└─────────────────────────────────────────────────────┘
```

**Copiar**: montar `const url = `${window.location.origin}${path}``; feedback "Copiado!" por 2s.

**Toggle**: ao mudar, chamar `onUpdate({ [key]: value })` imediatamente ou com debounce curto; mostrar loading no switch durante PATCH.

Quando `enabled === false`: indicador visual "Desativado" (badge âmbar/cinza) na linha.

### Critérios de aceite

- [ ] Quatro links listados com URL correta
- [ ] Copiar coloca URL completa no clipboard
- [ ] Toggle persiste via API

### Não fazer

- Não abrir link em nova aba automaticamente ao copiar

---

## 5.2 — Integrar em settings page

### O que fazer

Em `settings/page.tsx`, após `SettingsForm`:

```tsx
{settings ? (
  <>
    <SettingsForm initial={settings} onSaved={setSettings} />
    <PublicLinksSection
      settings={settings}
      onUpdate={async (patch) => {
        const result = await updateSettingsRequest({ ...settings, ...patch });
        if (result.ok) setSettings(result.settings);
        else throw new Error(result.message);
      }}
    />
  </>
) : null}
```

Ajustar `SettingsForm` para notificar parent on save se necessário (ou recarregar settings após save do form).

Separador visual entre "Congregação" e "Links públicos" (heading `Links públicos` + descrição: "Compartilhe com a congregação. Cada link pode ser desativado individualmente.").

### Critérios de aceite

- [ ] Seção visível em `/settings` para usuário autenticado
- [ ] Não quebra form existente de nome/dia

### Não fazer

- Não mover nome da congregação para outra página

---

## 5.3 — Persistência e estado

### O que fazer

`updateSettingsRequest` deve enviar merge de settings atuais + patch dos toggles.

Tratar erro: toast ou `role="alert"` inline "Não foi possível salvar."

Reverter switch em caso de falha (optimistic UI opcional — preferir aguardar resposta).

### Critérios de aceite

- [ ] Desativar toggle → `GET /settings` reflete false
- [ ] Reativar → público volta a funcionar

### Não fazer

- Não cachear settings stale após toggle

---

## 5.4 — Smoke test

### O que fazer

1. Login → Settings → copiar `/esta-semana` → colar em aba anônima → dados visíveis
2. Desativar "Esta semana" → aba anônima mostra link desativado
3. Reativar → dados voltam

### Critérios de aceite

- [ ] Fluxo completo funciona end-to-end
- [ ] Outros links permanecem ativos quando um é desativado

### Não fazer

- Não testar os quatro links desabilitados simultaneamente como requisito

---

## Verificação do grupo

Checklist manual:
- [ ] 4 botões copiar funcionam
- [ ] 4 toggles independentes
- [ ] Integração com API confirmada

## Handoff

Change completa. Operador pode compartilhar links e controlar acesso por escopo.
