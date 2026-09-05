# Task 11 — PWA shell and navigation

**Change:** `midweek-assignment-system`  
**Grupo:** 11 of 11  
**Pré-requisitos:** grupos de UI 3,5,9 (páginas existentes)  
**Desbloqueia:** release utilizável end-to-end

## Objetivo do grupo

PWA instalável + bottom navigation mobile-first (ícones; labels em breakpoints maiores) e desktop plenamente usável.

## Contexto para o subagent

- Spec: `../specs/pwa-shell/spec.md`
- Abas sugeridas: Início | Participantes | Designações | Histórico (+ Settings acessível a partir de Início ou ícone).
- Design D9.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/web` manifest/icons/PWA config | criar |
| `apps/web` BottomNav component | criar |
| layouts `(app)` | editar |

---

## 11.1 — PWA manifest and service worker

### O que fazer

- Configurar manifest (nome, ícones, display standalone).
- Service worker via plugin Next PWA compatível com App Router.
- Ícones mínimos 192 e 512.

### Critérios de aceite

- [x] Manifest servido
- [x] App instalável em Chrome mobile (critério Lighthouse PWA básico)

### Não fazer

- Não implementar push notifications

---

## 11.2 — Bottom navigation

### O que fazer

- Nav fixa inferior; ícones sempre; a partir de breakpoint (`sm` ou `md`) mostrar labels das telas.
- Highlight da rota ativa.
- Safe-area inset para iOS.

### Critérios de aceite

- [x] Phone: ícones sem depender de texto
- [x] Tablet/desktop: ícone + nome

### Não fazer

- Não usar drawer hamburger como navegação primária no mobile

---

## 11.3 — Desktop usability pass

### O que fazer

- Revisar páginas principais em viewport larga: listas, formulários, schedule, history, PDF.
- Garantir que conteúdo não fica preso atrás da bottom nav; max-width confortável.

### Critérios de aceite

- [x] Todos os fluxos primários acessíveis no desktop
- [x] Nenhum overflow horizontal óbvio nas telas principais

### Não fazer

- Não redesenhar como dashboard multi-coluna genérico se comprometer mobile-first

---

## Verificação do grupo

Lighthouse/PWA smoke + resize mobile/desktop checklist.

## Handoff para próxima task

Change implementável como MVP completo; próximos passos fora de escopo: import Apostila, multi-user.
