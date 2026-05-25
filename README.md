# CineSaaS - Backend SaaS multi-tenant para cinemas

Backend de um SaaS multi-tenant para cinemas, construido como projeto de estudos com foco em arquitetura backend, autenticacao, multi-tenancy e concorrencia aplicada ao dominio operacional do cinema.

O objetivo nao e apenas entregar features. O objetivo principal e aprender e demonstrar decisoes de engenharia proximas de um sistema real, com codigo organizado, evolucao modular e preocupacao com qualidade.

---

## Visao geral

O CineSaaS foi pensado como uma plataforma em que varios cinemas usam a mesma aplicacao com isolamento por tenant.

Na versao `v1` encerrada neste repositorio, a aplicacao permite:

- gerenciar usuarios e permissoes
- operar com contexto multi-tenant real
- cadastrar filmes, salas e sessoes
- consultar e operar o mapa de assentos por sessao
- criar hold, confirmar e cancelar reservas operacionais

Fora do escopo desta `v1` ficam deliberadamente `orders/checkout`, pagamento, tickets, check-in, filas, expiracao automatica por worker, observabilidade pesada, frontend e IA. Essas trilhas podem virar projetos futuros.

Documentacao HTTP em estilo Swagger da `v1`:

- UI: `/docs`
- JSON OpenAPI: `/docs/json`

---

## Objetivo tecnico do projeto

Este repositorio existe para estudar e praticar:

- arquitetura backend modular
- separacao de responsabilidades
- auth moderna com access token + refresh token
- multi-tenancy explicito via `tenant_id`
- RBAC por membership
- transacoes explicitas em fluxos criticos
- testes E2E com banco real
- evolucao incremental por modulos

Este projeto deve continuar sendo um laboratorio serio de backend, e nao um CRUD generico.

---

## Stack atual

- Node.js
- TypeScript
- Fastify
- `@fastify/jwt`
- PostgreSQL
- Drizzle ORM
- Zod
- `bcryptjs`
- Pino + `pino-pretty`
- Vitest + Supertest
- Docker Compose para infra local do banco

---

## Arquitetura

Fluxo principal da aplicacao:

`HTTP routes/controllers -> services -> repositories -> Drizzle -> PostgreSQL`

Organizacao atual:

- `src/http`: bootstrap da aplicacao
- `src/shared`: concerns compartilhados como `db`, `env`, `errors` e `logger`
- `src/modules`: modulos de dominio como `iam`, `movies`, `rooms`, `sessions`, `session-seats` e `reservations`

Padrao canonico dos modulos:

- `http`: rotas, controllers, middlewares e testes E2E
- `services`: casos de uso e regras de negocio
- `repositories`: contratos e implementacoes de acesso a dados
- `factories`: composicao manual de dependencias
- `domain`: enums e conceitos do dominio
- `dtos`: contratos de entrada e saida

Principios que guiam o projeto:

- controllers finos
- regras de negocio nos services
- multi-tenancy explicito
- foco em legibilidade
- abstractions apenas quando fizerem sentido

---

## Estado atual da implementacao

Hoje o projeto e uma API backend de processo unico em fase de fechamento de `v1`, com foundation pronta, modulo IAM/Auth bem avancado, `movies` funcional, `rooms` operacional, `sessions` operacional, `session-seats` operacional e `reservations` funcional no fluxo principal.

### Foundation pronta

Ja existe:

- bootstrap do Fastify
- healthcheck em `/health`
- logger estruturado
- error handler global
- validacao de env com Zod
- conexao PostgreSQL com pool
- migrations versionadas com Drizzle
- seed inicial
- graceful shutdown

### IAM/Auth implementado

Ja existe implementacao para:

- criacao de tenant com usuario owner inicial
- login com email e senha
- emissao de access token JWT
- refresh token opaco persistido por hash
- refresh token com rotacao
- logout por revogacao
- endpoint `/me`
- resolucao do tenant por header `x-tenant-id`
- RBAC basico por role de membership
- criacao de membros do tenant
- listagem de membros do tenant

### Movies implementado no escopo inicial

Ja existe implementacao para:

- busca de filmes em provider externo via `GET /movies/search`
- importacao de snapshot do TMDB para o catalogo interno do tenant via `POST /movies/import`
- listagem de filmes importados do tenant via `GET /movies`
- isolamento por tenant no catalogo interno
- prevencao de importacao duplicada por `(tenant_id, source_provider, source_movie_id)`

### Rooms implementado no escopo inicial

Ja existe implementacao para:

- cadastro de salas por tenant via `POST /rooms`
- listagem e busca por id via `GET /rooms` e `GET /rooms/:roomId`
- atualizacao de nome e layout via `PATCH /rooms/:roomId`
- `seat_layout` persistido em JSON
- `seat_count` derivado do layout ativo

### Sessions implementado no escopo inicial

Ja existe implementacao para:

- criacao de sessoes por tenant via `POST /sessions`
- listagem e busca por id via `GET /sessions` e `GET /sessions/:sessionId`
- integridade entre `movie`, `room` e tenant ativo
- persistencia de `room_layout_snapshot` no momento da criacao
- bloqueio de conflito de horario na mesma sala

### Session seats implementado no escopo inicial

Ja existe implementacao para:

- materializacao de assentos ativos por sessao a partir de `room_layout_snapshot`
- leitura do mapa da sessao via `GET /sessions/:sessionId/seats`
- ordenacao canonica por fileira e numero
- resumo agregado por status (`total`, `available`, `blocked`, `held`, `reserved`)
- bloqueio operacional via `PATCH /sessions/:sessionId/seats/:seatId/block`
- desbloqueio operacional via `PATCH /sessions/:sessionId/seats/:seatId/unblock`
- isolamento por tenant na leitura e escrita do mapa

### Reservations implementado no escopo inicial da v1

Ja existe implementacao para:

- criacao de hold via `POST /sessions/:sessionId/reservations`
- confirmacao via `POST /reservations/:reservationId/confirm`
- cancelamento via `POST /reservations/:reservationId/cancel`
- leitura operacional via `GET /reservations/:reservationId`
- expiracao lazy de hold
- concorrencia basica para evitar dupla reserva no mesmo assento
- tabelas `catalog.reservations` e `catalog.reservation_seats`

### O que ainda nao existe

Ainda nao ha implementacao real para:

- pedidos e checkout
- tickets e check-in
- Redis ativo
- pgvector ativo
- observabilidade completa
- CI/CD e deploy prontos

---

## Rotas atuais

### Publicas

- `GET /health`
- `POST /tenants`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Protegidas

- `GET /me`
- `GET /protected/ping`
- `GET /protected/tenant-ping`
- `GET /protected/admin-ping`
- `POST /members`
- `GET /members`
- `PATCH /members/:userId/role`
- `DELETE /members/:userId`
- `GET /movies/search`
- `POST /movies/import`
- `GET /movies`
- `POST /rooms`
- `GET /rooms`
- `GET /rooms/:roomId`
- `PATCH /rooms/:roomId`
- `POST /sessions`
- `GET /sessions`
- `GET /sessions/:sessionId`
- `GET /sessions/:sessionId/seats`
- `PATCH /sessions/:sessionId/seats/:seatId/block`
- `PATCH /sessions/:sessionId/seats/:seatId/unblock`
- `POST /sessions/:sessionId/reservations`
- `GET /reservations/:reservationId`
- `POST /reservations/:reservationId/confirm`
- `POST /reservations/:reservationId/cancel`

Referencia interativa das rotas da `v1`: Swagger em `/docs`

---

## Modelo de auth e multi-tenant

Fluxo atual:

1. o usuario faz login com email e senha
2. a API emite um access token JWT e um refresh token opaco
3. o access token carrega basicamente `sub`
4. o tenant ativo nao fica embutido no token
5. o contexto do tenant e resolvido por request via header `x-tenant-id`
6. `requireAuth` autentica o JWT
7. `requireTenant` verifica se o usuario pertence ao tenant
8. `requireRole` aplica autorizacao por role quando necessario

Essa abordagem atual prioriza clareza e simplicidade arquitetural, o que combina bem com o momento do projeto.

---

## Modelo de dados atual

Os schemas principais implementados ate agora sao `iam` e `catalog`.

Tabelas atuais:

- `iam.tenants`
- `iam.users`
- `iam.memberships`
- `iam.refresh_tokens`
- `catalog.movies`
- `catalog.rooms`
- `catalog.sessions`
- `catalog.session_seats`
- `catalog.reservations`
- `catalog.reservation_seats`

Relacoes importantes:

- um tenant possui varios memberships
- um user possui varios memberships
- membership conecta `user` e `tenant` com `role`
- um user possui varios refresh tokens
- uma `session` pertence a um `tenant`, um `movie` interno e uma `room`
- uma `session_seat` pertence a um `tenant` e a uma `session`
- uma `reservation` pertence a um `tenant`, a uma `session` e ao usuario criador
- uma `reservation` possui varios `reservation_seats`

Roles atuais:

- `OWNER`
- `ADMIN`
- `STAFF`
- `VIEWER`

---

## Testes

Estrategia atual:

- foco principal em testes E2E
- banco real nos cenarios de integracao
- limpeza das tabelas IAM a cada teste
- execucao sem paralelismo para evitar interferencia

Cobertura relevante hoje:

- criacao de tenant
- refresh token
- logout
- middlewares de auth e tenant
- endpoint `/me`
- cenario basico de RBAC
- fluxo inicial de `movies` com busca, importacao sem duplicidade e isolamento por tenant
- fluxo inicial de `rooms` com criacao por `STAFF`, validacao de layout e isolamento por tenant
- fluxo inicial de `sessions` com criacao por `STAFF`, snapshot de layout, conflito de horario e isolamento por tenant
- fluxo principal de `session-seats` com materializacao, leitura, bloqueio e desbloqueio
- fluxo principal de `reservations` com hold, confirmacao, cancelamento, expiracao lazy, leitura e concorrencia basica

Lacunas atuais:

- pouca cobertura de `/members`
- poucos testes negativos mais detalhados
- quase nenhum teste unitario

---

## Escopo final da v1

Esta `v1` deve ser lida como encerrada na seguinte fronteira funcional:

- auth e multi-tenant
- catalogo interno de filmes
- salas
- sessoes
- mapa de assentos por sessao
- reservas operacionais

Essa fronteira e intencional. O projeto pode receber apenas consolidacoes pequenas de documentacao, testes e consistencia, sem abrir novas frentes grandes de produto dentro deste repositorio.

Isso fecha a historia principal do backend operacional do cinema:

`tenant -> auth -> movie -> room -> session -> seats -> reservation`

Tudo o que vier depois disso deixa de ser requisito desta versao e pode virar novo estudo ou novo projeto.

Para mais contexto historico de evolucao, consulte `roadmap.md`.

---

## Executando o projeto

### Infra local

O `docker-compose.yml` atual sobe:

- PostgreSQL
- pgAdmin

Suba a infra com:

```bash
docker compose up -d
```

### Variaveis de ambiente

Preencha o `.env` com os valores necessarios, no minimo:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgres://postgres:postgres@localhost:5433/cinesaas
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5433/cinesaas_test
TMDB_API_KEY=sua_chave_tmdb_opcional_para_rotas_de_movies
JWT_SECRET=uma_chave_com_pelo_menos_32_caracteres
JWT_ACCESS_TTL=15m
```

### Migrations e seed

```bash
npm run db:migrate
npm run db:seed
```

### Desenvolvimento

```bash
npm run dev
```

### Testes

```bash
npm run test:e2e
```

Para build local:

```bash
npm run build
```

---

## Observacoes importantes

- o codigo atual vale mais do que descricoes antigas da documentacao
- este e um projeto de estudos, mas com preocupacao real de arquitetura
- a documentacao deve ser atualizada conforme o projeto evolui
- `AGENTS.md` funciona como memoria operacional para futuras IAs e mantenedores

---

## Autor

Felipe Sakai
