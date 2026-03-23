# AGENTS.md

## Objetivo deste arquivo

Este arquivo e a memoria operacional do projeto para futuras IAs e mantenedores.

Ele deve ser tratado como um documento vivo. Sempre que houver mudanca relevante de arquitetura, fluxo de negocio, stack, modulos, decisoes tecnicas, convencoes ou status do roadmap, atualize este arquivo no mesmo trabalho.

Contexto importante: este e um projeto de estudos, mas com intencao de simular um backend SaaS de nivel profissional. Entao as decisoes devem equilibrar aprendizado, clareza arquitetural e praticas proximas de producao.

## Resumo rapido

- Nome: `CineSaaS`
- Tipo: backend SaaS multi-tenant para cinemas
- Foco principal: estudos avancados de arquitetura backend, auth, multi-tenant, concorrencia, observabilidade e IA aplicada
- Estagio atual: fundacao pronta e modulo IAM/Auth ja bem adiantado
- Dominio implementado hoje: `iam`
- Estilo arquitetural: modular, orientado a dominio, com controllers finos e regras nos services

## Intencao do projeto

O projeto nao e so para "funcionar". Ele existe para estudar e demonstrar:

- arquitetura backend organizada
- separacao de responsabilidades
- multi-tenancy real via `tenant_id`
- autenticacao moderna com access token + refresh token
- transacoes explicitas em fluxos criticos
- testes E2E com banco real
- evolucao incremental por modulos

Este repositorio deve continuar parecendo um laboratorio serio de backend, e nao um CRUD generico.

## Stack atual

- Runtime: Node.js + TypeScript
- HTTP: Fastify
- Auth: `@fastify/jwt`
- Banco: PostgreSQL
- ORM: Drizzle ORM
- Validacao: Zod
- Hash de senha: `bcryptjs`
- Logging: Pino + `pino-pretty`
- Testes: Vitest + Supertest
- Infra local: Docker Compose para Postgres + pgAdmin

Arquivos-base importantes:

- `package.json`
- `src/http/app.ts`
- `src/http/server.ts`
- `src/shared/env/index.ts`
- `src/shared/db/client.ts`
- `src/shared/db/schema/iam.ts`
- `roadmap.md`
- `readme.md`

## Arquitetura atual

Fluxo principal:

`HTTP routes/controllers -> services -> repositories -> Drizzle -> PostgreSQL`

Organizacao principal:

- `src/http`: bootstrap da aplicacao
- `src/shared`: infraestrutura e concerns compartilhados (`db`, `env`, `errors`, `logger`)
- `src/modules/iam`: modulo de negocio atualmente implementado

Dentro de `src/modules/iam`:

- `http/`: rotas, controllers, middlewares, testes E2E do modulo
- `services/`: casos de uso e regras de negocio
- `repositories/`: contratos e implementacoes Drizzle
- `factories/`: composicao manual das dependencias
- `domain/`: enums e conceitos centrais do dominio
- `dtos/`: contratos de entrada e saida

## Estado real da implementacao

Hoje o sistema e uma API backend de processo unico, com um unico modulo de negocio relevante: IAM.

### Foundation pronta

Ja existe:

- bootstrap do Fastify
- healthcheck em `/health`
- registro global de error handler
- logger estruturado
- carregamento e validacao de env com Zod
- conexao PostgreSQL com pool
- migrations Drizzle versionadas
- seed inicial
- graceful shutdown do app e do pool

### IAM/Auth implementado

Ja existe implementacao para:

- criacao de tenant com usuario owner inicial
- login com email e senha
- emissao de access token JWT
- emissao de refresh token opaco persistido por hash
- refresh token com rotacao
- logout por revogacao de refresh token
- endpoint `/me`
- validacao de tenant por header `x-tenant-id`
- RBAC basico por membership role
- criacao e listagem de membros do tenant
- endpoints de teste/protecao para auth, tenant e role

### Rotas atuais

Rotas publicas:

- `GET /health`
- `POST /tenants`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

Rotas protegidas:

- `GET /me`
- `GET /protected/ping`
- `GET /protected/tenant-ping`
- `GET /protected/admin-ping`
- `POST /members`
- `GET /members`

## Modelo de dados atual

Schema principal implementado: `iam`

Tabelas atuais:

- `iam.tenants`
- `iam.users`
- `iam.memberships`
- `iam.refresh_tokens`

Relacoes principais:

- um tenant possui varios memberships
- um user possui varios memberships
- membership conecta `user <-> tenant` com `role`
- um user possui varios refresh tokens

Garantias importantes ja presentes:

- slug de tenant unico
- email de usuario unico
- combinacao `(tenant_id, user_id)` unica em memberships
- hash de refresh token unico
- cascata em remocoes relacionadas

Roles atuais:

- `OWNER`
- `ADMIN`
- `STAFF`
- `VIEWER`

## Auth e contexto multi-tenant

Fluxo atual:

1. login valida credenciais e memberships do usuario
2. access token JWT carrega basicamente `sub`
3. tenant ativo nao vai no token; ele e resolvido por request via header `x-tenant-id`
4. `requireAuth` autentica o JWT
5. `requireTenant` verifica membership do usuario naquele tenant
6. `requireRole` autoriza por role quando necessario

Observacao importante: o contexto multi-tenant atual e explicito e simples. Isso parece intencional e deve ser preservado enquanto o projeto estiver priorizando clareza sobre sofisticacao prematura.

## Convencoes importantes

- Controllers devem continuar finos; validacao HTTP e adaptacao de request ficam neles
- Regras de negocio devem ir para `services`
- Acesso ao banco deve passar por repositories sempre que fizer sentido
- Factories sao o mecanismo atual de injecao de dependencia
- Nomes de arquivos TypeScript do dominio devem usar kebab-case com sufixos explicitos, por exemplo `update-member-role.controller.ts`, `auth-refresh.service.ts` e `make-auth-login-service.factory.ts`
- Operacoes criticas devem preferir transacoes explicitas
- Multi-tenant deve continuar explicito, nao escondido magicamente em infra
- Testes devem priorizar comportamento real via HTTP + banco quando o caso justificar

## Testes

Estrategia atual:

- foco principal em testes E2E
- uso de banco real
- limpeza das tabelas IAM a cada teste via `TRUNCATE`
- execucao sem paralelismo para evitar interferencia entre cenarios

Cobertura atual relevante:

- criacao de tenant
- refresh token
- logout
- middlewares de auth/tenant
- `/me`
- caso basico de RBAC
- update de role de membro

Lacunas percebidas hoje:

- poucos ou nenhum teste unitario
- cobertura limitada para `/members`
- poucas verificacoes de cenarios negativos mais detalhados
- pouca cobertura para infraestrutura/foundation

## Roadmap pretendido

O roadmap em `roadmap.md` foi revisado para refletir melhor duas coisas ao mesmo tempo:

- o estado real atual do codigo
- a ordem de estudo que maximiza aprendizado tecnico
- as tecnologias previstas para futuras fases, para servir como memoria de estudo

Fases definidas hoje:

0. Foundation
1. IAM / Auth
2. Multi-tenant & RBAC
3. Catalogo interno
4. Integracao externa de catalogo
5. Assentos e mapa da sessao
6. Reserva com concorrencia
7. Pedidos e checkout
8. Tickets e check-in
9. Observabilidade
10. Cache & performance
11. IA aplicada ao SaaS
12. CI/CD & deploy

Leitura honesta do estado atual:

- modulo 0 esta concluido
- modulo 1 esta bem mais avancado do que o README sugere
- parte do modulo 2 ja comecou na pratica (tenant context + roles + membership checks)
- os modulos de produto do cinema ainda nao comecaram

## Inconsistencias atuais entre docs e codigo

Estas observacoes sao importantes para futuras IAs nao assumirem coisas erradas:

- `readme.md` foi alinhado ao estado real atual, mas deve continuar sendo revisado quando novos modulos entrarem
- `.env.example` ja foi alinhado com `DATABASE_URL_TEST`, mas futuras mudancas de env devem atualizar exemplo e documentacao juntos
- o script `start` ja foi alinhado ao output atual do build; se a estrutura de compilacao mudar, revisar `package.json`
- havia um BOM em `tsconfig.json` que quebrava o `tsc-alias`; isso foi corrigido e deve ser evitado em edicoes futuras
- existe pequena inconsistência de desenho interno: nem todos os services seguem o mesmo nivel de desacoplamento dos repositories/factories, por exemplo `createMember.service.ts` usa `db` global e `getMe.service.ts` depende de implementacao concreta

## Decisoes arquiteturais para preservar

Se uma futura IA tocar neste projeto, deve preservar salvo instrucao contraria:

- organizacao por modulo de dominio
- clareza entre camada HTTP, service e repository
- uso de Postgres como fonte central de verdade
- foco em legibilidade e aprendizado, sem exagerar em abstractions prematuras
- incremento por modulos entregaveis
- postura de projeto de estudos serio, com qualidade suficiente para portfolio

## O que ainda nao existe e nao deve ser presumido

Nao assumir como implementado, a menos que o codigo mude:

- catalogo de filmes, salas ou sessoes
- mapa de assentos
- reservas concorrentes
- pedidos e checkout
- tickets e check-in
- Redis ativo
- pgvector ativo
- observabilidade completa
- CI/CD pronto
- deploy da API via Docker Compose atual
- signup publico tradicional separado do fluxo de criacao de tenant owner

## Como futuras IAs devem atualizar este arquivo

Sempre atualizar este `AGENTS.md` quando houver pelo menos um destes eventos:

- novo modulo iniciado ou concluido
- mudanca de arquitetura ou convencao relevante
- nova dependencia estrutural importante
- novo fluxo de autenticacao/autorizacao
- mudanca de estrategia de testes
- alteracao relevante no roadmap real
- descoberta de divergencia importante entre docs e codigo

Ao atualizar, manter:

- o que existe de fato hoje
- o que esta planejado mas ainda nao existe
- as inconsistencias abertas
- decisoes que precisam ser preservadas

Evitar transformar este arquivo em marketing. Ele deve ser honesto, operacional e util para continuidade.

## Fonte de verdade pratica

Quando houver conflito entre narrativa e implementacao:

1. o codigo atual vale mais que o README
2. o roadmap vale como intencao, nao como estado real
3. este arquivo deve ser atualizado para explicar a diferenca

## Ultima leitura consolidada

Baseado no estado atual do repositorio em `Mon Mar 23 2026`, ja considerando a revisao do roadmap para um fluxo de estudo mais realista.
