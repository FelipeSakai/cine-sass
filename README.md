# CineSaaS - Backend SaaS multi-tenant para cinemas

Backend de um SaaS multi-tenant para cinemas, construido como projeto de estudos com foco em arquitetura backend, autenticacao, multi-tenancy, concorrencia, observabilidade e IA aplicada.

O objetivo nao e apenas entregar features. O objetivo principal e aprender e demonstrar decisoes de engenharia proximas de um sistema real, com codigo organizado, evolucao modular e preocupacao com qualidade.

---

## Visao geral

O CineSaaS foi pensado para evoluir como uma plataforma em que varios cinemas usam a mesma aplicacao com isolamento por tenant.

No desenho completo do produto, a aplicacao deve permitir:

- gerenciar usuarios e permissoes
- operar com contexto multi-tenant real
- cadastrar filmes, salas e sessoes
- reservar assentos com seguranca
- vender ingressos
- validar tickets no check-in
- futuramente oferecer recursos de IA isolados por tenant

Hoje, porem, o modulo realmente implementado e o de IAM/Auth.

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
- `src/modules/iam`: modulo de identidade e acesso

Dentro do modulo `iam`:

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

Hoje o projeto e uma API backend de processo unico, com foundation pronta e modulo IAM/Auth bem avancado.

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

### O que ainda nao existe

Ainda nao ha implementacao real para:

- catalogo de filmes
- salas e sessoes como modulo de produto
- mapa de assentos
- reserva concorrente
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

O schema principal implementado ate agora e `iam`.

Tabelas atuais:

- `iam.tenants`
- `iam.users`
- `iam.memberships`
- `iam.refresh_tokens`

Relacoes importantes:

- um tenant possui varios memberships
- um user possui varios memberships
- membership conecta `user` e `tenant` com `role`
- um user possui varios refresh tokens

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

Lacunas atuais:

- pouca cobertura de `/members`
- poucos testes negativos mais detalhados
- quase nenhum teste unitario

---

## Roadmap de estudo

O roadmap foi reorganizado para refletir melhor o estado real do projeto e a ordem de aprendizado mais util.

### Fase 0 - Foundation

Status: concluido

### Fase 1 - IAM / Auth

Status: avancado

### Fase 2 - Multi-tenant & RBAC

Status: parcial

### Fase 3 - Catalogo interno

Status: planejado

### Fase 4 - Integracao externa de catalogo

Status: planejado

### Fase 5 - Assentos e mapa da sessao

Status: planejado

### Fase 6 - Reserva com concorrencia

Status: planejado

### Fase 7 - Pedidos e checkout

Status: planejado

### Fase 8 - Tickets e check-in

Status: planejado

### Fase 9 - Observabilidade

Status: planejado

### Fase 10 - Cache & performance

Status: planejado

### Fase 11 - IA aplicada ao SaaS

Status: planejado

### Fase 12 - CI/CD & deploy

Status: planejado

Para mais detalhes, consulte `roadmap.md`.

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

---

## Observacoes importantes

- o codigo atual vale mais do que descricoes antigas da documentacao
- este e um projeto de estudos, mas com preocupacao real de arquitetura
- a documentacao deve ser atualizada conforme o projeto evolui
- `AGENTS.md` funciona como memoria operacional para futuras IAs e mantenedores

---

## Autor

Felipe Sakai
