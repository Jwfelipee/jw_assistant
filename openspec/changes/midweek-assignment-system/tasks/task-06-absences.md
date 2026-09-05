# Task 6 — Absences

**Change:** `midweek-assignment-system`  
**Grupo:** 6 of 11  
**Pré-requisitos:** [5. Participants](./task-05-participants.md)  
**Desbloqueia:** schedule eligibility (grupo 8)

## Objetivo do grupo

Ausências com/sem data fim, justificativa oculta, histórico, alertas de fim e helpers de elegibilidade.

## Contexto para o subagent

- Spec: `../specs/absences/spec.md`
- Open-ended → **nunca** designável até reativar.
- Dated → após `endsOn`, aparece em listas futuras mesmo sem reativação explícita (RN 03.1).
- Justificativa só com reveal explícito.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/absences/**` | criar |
| `packages/shared` ou api `eligibility` helper | criar |
| `apps/web` UI ausências + alertas home | criar/editar |

---

## 6.1 — Absences API

### O que fazer

- Create absence; list history by participant.
- Default responses **omit** justification; `GET ...?revealJustification=true` ou `POST .../reveal` inclui texto.
- Acknowledge end; reactivate (encerra ausência / marca ativo); create new period from alert.

### Critérios de aceite

- [x] Listagem padrão sem justification
- [x] Reveal retorna texto
- [x] Open-ended e dated persistem corretamente

### Não fazer

- Não logar justification em logs de aplicação

---

## 6.2 — Eligibility helpers

### O que fazer

Função `isEligibleForMeetingDate(participantId, meetingDate)`:

1. Open-ended active → false  
2. Dated active e meetingDate ∈ [startsOn, endsOn] → false  
3. Dated ended (meetingDate > endsOn) → true (mesmo sem acknowledge)  
4. Sem ausência → true  

### Critérios de aceite

- [x] Testes cobrem Nov absence → Dec candidate true; open-ended always false

### Não fazer

- Não aplicar ainda filtro de sexo/privilégio (schedule)

---

## 6.3 — Absence UI + dashboard alerts

### O que fazer

- UI no detalhe do participante: criar ausência, histórico, botão mostrar justificativa.
- Home: alertas de ausências encerradas não acknowledged com ações reativar / novo período.

### Critérios de aceite

- [x] Justificativa oculta até clique
- [x] Alerta aparece após endsOn

### Não fazer

- Não enviar e-mail/push

---

## Verificação do grupo

Testes do helper + smoke UI.

## Handoff para próxima task

Eligibility pronto para o motor de designações.
