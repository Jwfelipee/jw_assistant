# Task 3 — Auth single-user

**Change:** `midweek-assignment-system`  
**Grupo:** 3 of 11  
**Pré-requisitos:** [2. Database schema and seed](./task-02-database-schema-and-seed.md)  
**Desbloqueia:** todos os grupos de API/UI autenticados

## Objetivo do grupo

Login/logout do único usuário da congregação, cookie de sessão e proteção de rotas API + Next.

## Contexto para o subagent

- Spec: `../specs/auth-single-user/spec.md`
- Design D2: cookie httpOnly; credenciais seedadas.
- Não há multi-tenant nem OAuth.

## Arquivos esperados ao concluir

| Arquivo | Ação |
|---------|------|
| `apps/api/src/auth/**` | criar |
| `apps/api/src/common/guards/**` | criar |
| `apps/web/app/login/**` | criar |
| `apps/web` middleware ou layout auth | criar |

---

## 3.1 — Nest auth module

### O que fazer

- `POST /auth/login` { email, password } → Set-Cookie session/JWT httpOnly Secure em prod.
- `POST /auth/logout` invalida sessão.
- `GET /auth/me` retorna usuário autenticado.
- Hash com bcrypt/argon2; comparar com `User.passwordHash`.

### Critérios de aceite

- [x] Login válido retorna 200 + cookie
- [x] Login inválido retorna 401

### Não fazer

- Não criar registro público de usuários

---

## 3.2 — Protect API routes

### O que fazer

- Guard global ou middleware: tudo autenticado exceto `GET /health`, `POST /auth/login`.

### Critérios de aceite

- [x] `GET /participants` sem cookie → 401
- [x] Com cookie válido → passa do guard (mesmo que 404 se módulo ainda não exista — preferir smoke com `/auth/me`)

### Não fazer

- Não expor passwordHash em responses

---

## 3.3 — Next login + route protection

### O que fazer

- Página `/login` em pt-BR.
- Redirecionar páginas autenticadas → `/login` se sem sessão.
- Após login, redirecionar para home.

### Critérios de aceite

- [x] Fluxo login → home funciona em browser
- [x] Logout remove acesso

### Não fazer

- Não implementar bottom nav completo (grupo 11) além do mínimo para navegar

---

## Verificação do grupo

curl login/logout/me; smoke no browser.

## Handoff para próxima task

Chamadas autenticadas disponíveis para settings e demais módulos.
