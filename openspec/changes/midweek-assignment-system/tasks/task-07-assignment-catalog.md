# Task 7 — Assignment catalog

**Change:** `midweek-assignment-system`  
**Grupo:** 7 of 11  
**Pré-requisitos:** [2. Database](./task-02-database-schema-and-seed.md), [3. Auth](./task-03-auth-single-user.md)  
**Desbloqueia:** [8. Schedule engine](./task-08-assignment-schedule-engine-and-api.md)

## Objetivo do grupo

API e UI do catálogo de tipos de parte FSM (e proteções de tipos sistema / NVC).

## Contexto para o subagent

- Spec: `../specs/assignment-catalog/spec.md`
- FSM: cadastro separado com sexo permitido e 1 ou 2 participantes.
- Tipos sistema não deletáveis; Estudo bíblico sempre último na semana (enforced no schedule, protegido aqui).

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/catalog/**` | criar |
| `apps/web` UI catálogo FSM | criar |

---

## 7.1 — PartType API

### O que fazer

- CRUD para tipos `topic=MINISTRY` (FSM).
- Listar tipos NVC; permitir criar tipos NVC adicionais; bloquear delete de `isSystem`.
- Campos: label, allowedSexes[], slotMode ONE|TWO, allowedPrivileges[], countsAsMinistryPractice (FSM default true).

### Critérios de aceite

- [ ] Não deleta PartType sistema → 400/403
- [ ] Cria FSM com 2 participantes e ambos sexos
- [ ] Seed defaults listáveis

### Não fazer

- Não instanciar WeekParts aqui

---

## 7.2 — Catalog UI

### O que fazer

- Tela de gerenciamento FSM: listar, criar, editar, remover (não sistema).
- Form claro para sexo e 1 vs 2 participantes.

### Critérios de aceite

- [ ] Usuário cria novo tipo e ele aparece na lista
- [ ] Tipos sistema não mostram ação de excluir

### Não fazer

- Não importar temas da Apostila

---

## Verificação do grupo

CRUD API + UI FSM.

## Handoff para próxima task

Catálogo disponível para template semanal.
