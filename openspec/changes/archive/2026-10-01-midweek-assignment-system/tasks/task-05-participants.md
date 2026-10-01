# Task 5 — Participants

**Change:** `midweek-assignment-system`  
**Grupo:** 5 of 11  
**Pré-requisitos:** [3. Auth](./task-03-auth-single-user.md), [2. Database](./task-02-database-schema-and-seed.md)  
**Desbloqueia:** [6. Absences](./task-06-absences.md), schedule UI

## Objetivo do grupo

CRUD de participantes, associações de pares, validação privilégio×sexo, contadores visíveis e entrada de histórico.

## Contexto para o subagent

- Spec: `../specs/participants/spec.md`
- Privilégios M: Ancião, Servo, Pioneiro Regular, Batizado, Publicador  
- Privilégios F: Pioneira Regular, Batizado, Publicador  
- Participantes **não** têm login.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/participants/**` | criar |
| `apps/web` rotas participantes | criar |

---

## 5.1 — Participants CRUD API

### O que fazer

- Endpoints: list, get, create, update, (soft delete opcional).
- Validar privilege vs sex.
- Campos: name, phone?, sex, privilege, rolePreference (`ANY` | `ASSISTANT_ONLY` | `PRINCIPAL_ONLY`).
- Retornar contadores.

### Critérios de aceite

- [ ] Criar sem telefone OK
- [ ] Ancião em mulher → 400
- [ ] Publicador em ambos → 201

### Não fazer

- Não criar User para participante

---

## 5.2 — Associations API

### O que fazer

- `POST /participants/:id/associations` { otherParticipantId, reason }
- `DELETE` associação
- Listar no detalhe do participante (bidirecional)

### Critérios de aceite

- [ ] Associação aparece nos dois lados
- [ ] Reason obrigatório

### Não fazer

- Não implementar alerta misto aqui (schedule)

---

## 5.3 — Participants UI

### O que fazer

- Lista, formulário criar/editar, detalhe com contadores e link/seção de histórico (pode consumir API de history do grupo 8 se ainda stub — no mínimo placeholder com fetch quando endpoint existir; preferir listar assignments do participante se endpoint parcial `GET /participants/:id/assignments` for criado aqui).

### Critérios de aceite

- [ ] Fluxo criar → listar → editar funciona no mobile layout
- [ ] Detalhe mostra contadores (mesmo zerados)

### Não fazer

- Não construir bottom nav final (grupo 11), só páginas acessíveis

---

## Verificação do grupo

CRUD via API + UI smoke.

## Handoff para próxima task

Participantes prontos para ausências e designações.
