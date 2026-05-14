# AGENTS.md

## Objetivo deste arquivo

Este arquivo e a memoria operacional do projeto para futuras IAs e mantenedores.

Ele deve ser tratado como um documento vivo. Sempre que houver mudanca relevante de arquitetura, fluxo de negocio, stack, modulos, decisoes tecnicas, convencoes ou status do roadmap, atualize este arquivo no mesmo trabalho.

Contexto importante: este e um projeto de estudos, mas com intencao de simular um backend SaaS de nivel profissional. Entao as decisoes devem equilibrar aprendizado, clareza arquitetural, uso profissional das tecnologias e praticas proximas de producao.

## Resumo rapido

- Nome: `CineSaaS`
- Tipo: backend SaaS multi-tenant para cinemas
- Foco principal: estudos avancados de arquitetura backend, auth, multi-tenant, concorrencia, observabilidade e IA aplicada
- Estagio atual: fundacao pronta, IAM/Auth avancado, `movies`, `rooms`, `sessions` e `session-seats` operacionais, com modelagem inicial de `reservations` iniciada
- Dominio implementado hoje: `iam`, `movies`, `rooms`, `sessions`, `session-seats` e modelagem inicial de `reservations`
- Estilo arquitetural: modular, orientado a dominio, com controllers finos e regras nos services

## Intencao do projeto

O projeto nao e so para "funcionar". Ele existe para estudar e demonstrar:

- tecnologias novas aplicadas em um sistema coerente
- arquitetura backend organizada
- separacao de responsabilidades
- multi-tenancy real via `tenant_id`
- autenticacao moderna com access token + refresh token
- transacoes explicitas em fluxos criticos
- testes E2E com banco real
- evolucao incremental por modulos

Este repositorio deve continuar parecendo um laboratorio serio de backend, e nao um CRUD generico.

## Filosofia de evolucao

O foco real deste projeto e aprender tecnologias novas e aplica-las dentro de um sistema com cara de produto real.

Isso significa:

- buscar um nivel profissional de organizacao e decisao tecnica
- evitar endurecimento excessivo antes da hora
- aceitar consolidacao parcial quando ela ja sustenta o proximo aprendizado
- priorizar modulos que ensinem habilidades novas em vez de polir indefinidamente o que ja funciona
- manter o roadmap finito e com escopo controlado

Regra pratica para futuras IAs e mantenedores:

- cada fase deve ficar boa o bastante para sustentar a proxima
- nem toda fase precisa ficar exaustiva em nivel de producao real antes do projeto avancar
- quando houver trade-off entre perfeccionismo e aprendizado novo, priorizar o aprendizado sem perder coerencia arquitetural
- evitar adicionar tecnologias novas que empurrem o projeto para complexidade desproporcional ou infinita

Diretriz pratica no estado atual do projeto:

- o modulo `movies` esta considerado consolidado o bastante para os objetivos de estudo atuais
- evitar gastar ciclos excessivos em polimento incremental de `movies` se isso nao destravar aprendizado novo
- os proximos estudos devem priorizar a cadeia operacional do cinema: salas, sessoes, mapa de assentos e reservas

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
- `specs/system-architecture.md`
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
- `src/modules`: modulos de dominio seguindo um padrao canonico
- `specs/`: especificacoes vivas de arquitetura e decisoes transversais do sistema

Padrao canonico de modulo em `src/modules/<modulo>`:

- `domain/`: enums, value objects e conceitos centrais do dominio
- `dtos/`: contratos de entrada e saida
- `factories/`: composicao manual das dependencias
- `http/controllers/`: adaptacao HTTP fina
- `http/middlewares/`: guards e contexto HTTP
- `http/routes/`: registro de rotas Fastify
- `http/tests/`: testes E2E do modulo
- `integrations/`: clients, mappers e providers externos quando existirem
- `services/`: casos de uso e regras de negocio
- `repositories/contracts.ts`: contratos e tipos compartilhados de persistencia
- `repositories/drizzle/`: implementacoes Drizzle

Observacao: `iam` continua sendo a referencia pratica principal desse padrao, e `movies` agora tambem ja tem implementacao funcional inicial com provider externo + catalogo interno.

Specs importantes hoje:

- `specs/system-architecture.md`: padrao canonico de estrutura modular
- `specs/movies-module.md`: estrategia do modulo `movies` como catalogo interno alimentado por provider externo
- `specs/rooms-and-sessions-module.md`: direcao de planejamento para os proximos modulos operacionais de salas e sessoes
- `specs/sessions-module.md`: spec detalhada da primeira entrega do modulo `sessions`, alinhada ao estado atual de `movies` e `rooms`
- `specs/session-seats-module.md`: spec detalhada da proxima entrega de mapa de assentos por sessao, preparando a evolucao para reservas com concorrencia
- `specs/reservations-module.md`: spec detalhada da proxima fase de reservas com concorrencia, hold temporario e confirmacao segura sobre `session_seats`

## Estado real da implementacao

Hoje o sistema e uma API backend de processo unico, com IAM maduro para a fase atual, `movies` funcional como catalogo interno, `rooms` operacional, `sessions` com primeira entrega funcional, `session-seats` com leitura e bloqueio operacional manual iniciais, e `reservations` com criacao de hold, confirmacao, cancelamento, expiracao lazy e leitura operacional iniciais.

O modulo `movies` ja implementa busca em provider externo, importacao para catalogo interno por tenant e listagem de filmes importados, mantendo o contrato arquitetural do projeto.

A estrategia definida para `movies` e trata-lo como catalogo interno do tenant alimentado por provider externo, evitando tanto CRUD manual completo quanto dependencia direta da API externa nos modulos futuros.

O modulo `rooms` agora fornece cadastro e consulta de salas por tenant, com layout de assentos persistido em JSON e `seat_count` derivado do layout ativo.

O modulo `sessions` agora fornece agenda operacional por tenant, vinculando filme interno e sala, persistindo `room_layout_snapshot` e bloqueando conflito de horario na mesma sala.

O modulo `session-seats` agora possui modelagem persistida para materializar assentos ativos por sessao a partir de `room_layout_snapshot`, endpoint publico de leitura do mapa e bloqueio operacional manual por assento.

O modulo `reservations` agora ja possui modelagem persistida, criacao inicial de hold, confirmacao, cancelamento, expiracao lazy e leitura operacional, mas ainda nao fechou fases futuras como pedidos/checkout.

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
- remocao de membro do tenant por exclusao de membership
- endpoints de teste/protecao para auth, tenant e role

### Movies implementado no escopo inicial

Ja existe implementacao para:

- `GET /movies/search` consultando provider externo normalizado
- `POST /movies/import` importando snapshot do TMDB para `catalog.movies`
- `GET /movies` listando o catalogo interno do tenant
- deduplicacao por tenant ao reimportar o mesmo `source_movie_id`
- provider TMDB encapsulado em `integrations/providers/`

### Rooms implementado no escopo inicial

Ja existe implementacao para:

- `POST /rooms` criando sala do tenant com `seat_layout` JSON
- `GET /rooms` listando salas do tenant
- `GET /rooms/:roomId` buscando sala do tenant por id
- `PATCH /rooms/:roomId` atualizando nome e layout da sala
- validacao de layout com fileiras unicas, assentos unicos por fileira e pelo menos um assento ativo
- `seat_count` persistido a partir da contagem de assentos ativos
- RBAC de escrita permitindo `OWNER`, `ADMIN` e `STAFF`

### Sessions implementado no escopo inicial

Ja existe implementacao para:

- `POST /sessions` criando sessao do tenant com `movie_id`, `room_id`, `starts_at` e `ends_at`
- `GET /sessions` listando sessoes do tenant
- `GET /sessions/:sessionId` buscando sessao do tenant por id
- validacao de integridade por tenant para filme e sala
- persistencia de `room_layout_snapshot` no momento da criacao
- bloqueio de sobreposicao entre sessoes `SCHEDULED` na mesma sala
- RBAC de escrita permitindo `OWNER`, `ADMIN` e `STAFF`

### Session Seats com Tasks 2 e 3 concluidas

Ja existe implementacao para:

- tabela `catalog.session_seats`
- materializacao de assentos ativos na mesma transacao de criacao da sessao
- identidade estavel por `seat_key` derivada de `row_label + seat_number`
- isolamento por tenant via `tenant_id` persistido no assento da sessao
- status inicial `AVAILABLE` para assentos materializados
- suporte ao estado `HELD` no enum de status do assento da sessao
- `GET /sessions/:sessionId/seats` com ordenacao canonica e resumo agregado por status
- `PATCH /sessions/:sessionId/seats/:seatId/block` para bloquear assento `AVAILABLE`
- `PATCH /sessions/:sessionId/seats/:seatId/unblock` para devolver assento `BLOCKED` a `AVAILABLE`

Ainda nao existe nesta fase:

- reservas ou holds concorrentes funcionais

### Reservations com Tasks 1, 2, 3 e 4 iniciadas no codigo

Ja existe implementacao para:

- enum `reservation_status`
- tabela `catalog.reservations`
- tabela `catalog.reservation_seats`
- estado `HELD` adicionado ao enum de `session_seats`
- `POST /sessions/:sessionId/reservations` para criacao inicial de hold
- `GET /reservations/:reservationId` para leitura operacional inicial da reserva
- `POST /reservations/:reservationId/confirm` para confirmar hold
- `POST /reservations/:reservationId/cancel` para cancelar hold
- repositories Drizzle iniciais do modulo
- services transacionais iniciais para segurar, confirmar, cancelar, expirar lazy e ler reservas
- spec propria em `specs/reservations-module.md`
- testes E2E validados localmente para hold, confirmacao, cancelamento, expiracao lazy, leitura e concorrencia basica

Ainda nao existe nesta fase:

- pedidos/checkout

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

## Modelo de dados atual

Schemas com implementacao iniciada: `iam` e `catalog`

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

Relacoes principais:

- um tenant possui varios memberships
- um user possui varios memberships
- membership conecta `user <-> tenant` com `role`
- um user possui varios refresh tokens
- uma session pertence a um tenant, um movie interno e uma room
- um session_seat pertence a um tenant e a uma session
- uma reservation pertence a um tenant, a uma session e a um user criador
- uma reservation possui varios reservation_seats

Garantias importantes ja presentes:

- slug de tenant unico
- email de usuario unico
- combinacao `(tenant_id, user_id)` unica em memberships
- hash de refresh token unico
- combinacao `(tenant_id, source_provider, source_movie_id)` unica em `catalog.movies`
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
- Arquivos de rota devem ficar apenas em `http/routes/`
- Contratos de repositorio devem ficar em `repositories/contracts.ts` ou arquivos `*.contract.ts` no mesmo nivel
- Integracoes externas devem ficar em `integrations/`, nunca misturadas com `http/` ou `services/`
- Nomes de arquivos TypeScript do dominio devem usar kebab-case com sufixos explicitos, por exemplo `update-member-role.controller.ts`, `auth-refresh.service.ts` e `make-auth-login-service.factory.ts`
- Artefatos de build em `dist/` nao devem ser versionados; gerar localmente via `npm run build`
- Operacoes criticas devem preferir transacoes explicitas
- Multi-tenant deve continuar explicito, nao escondido magicamente em infra
- Testes devem priorizar comportamento real via HTTP + banco quando o caso justificar

## Testes

Estrategia atual:

- foco principal em testes E2E
- uso de banco real
- limpeza das tabelas IAM a cada teste via `TRUNCATE` com cascata para `catalog.movies`
- execucao sem paralelismo para evitar interferencia entre cenarios

Cobertura atual relevante:

- criacao de tenant
- refresh token
- logout
- middlewares de auth/tenant
- `/me`
- caso basico de RBAC
- update de role de membro
- remocao de membro
- fluxo inicial de `movies` com busca, importacao duplicada e isolamento por tenant
- fluxo inicial de `rooms` com criacao por `STAFF`, validacao de layout, patch e isolamento por tenant
- fluxo inicial de `sessions` com criacao por `STAFF`, snapshot de layout, conflito de horario e isolamento por tenant
- materializacao inicial de `session_seats` a partir do snapshot da sessao, incluindo filtragem de assentos inativos e congelamento apos alteracao da sala

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
4.5. Contratos de API e documentacao viva
5. Integracao externa de catalogo
6. Assentos e mapa da sessao
7. Reserva com concorrencia
8. Pedidos e checkout
8.5. Auditoria e eventos de dominio
9. Filas e jobs assincronos
10. Tickets e check-in
11. Observabilidade
12. Cache & performance
12.5. Storage e arquivos
13. IA aplicada ao SaaS
14. CI/CD & deploy

Leitura honesta do estado atual:

- modulo 0 esta concluido
- modulo 1 esta bem mais avancado do que o README sugere
- parte do modulo 2 ja comecou na pratica (tenant context + roles + membership checks)
- modulo 3 ja comecou funcionalmente com catalogo interno inicial
- `rooms` e `sessions` ja iniciaram a cadeia operacional do cinema, e `session-seats` agora cobre leitura e bloqueio operacional manual do mapa por sessao, enquanto `reservations` ja iniciou hold, confirmacao, cancelamento, expiracao lazy e leitura, mas ainda nao fechou a fase de concorrencia completa
- a integracao externa inicial com TMDB tambem ja comecou na pratica
- para fins de roadmap de estudo, `movies` nao precisa de consolidacao extensa antes de o projeto avancar para `rooms`/salas e `sessions`
- `sessions` agora cobre a primeira agenda operacional por sala, com snapshot de layout e prevencao de conflito de horario
- `session-seats` agora possui materializacao persistida, leitura operacional, suporte a `HELD` e bloqueio manual por assento
- o proximo passo planejado agora e implementar reservas com concorrencia sobre `session_seats`
- `specs/reservations-module.md` passa a ser a referencia principal da fase atual em andamento
- `specs/sessions-module.md` passa a servir como memoria da primeira entrega do modulo e referencia para sua evolucao

## Inconsistencias atuais entre docs e codigo

Estas observacoes sao importantes para futuras IAs nao assumirem coisas erradas:

- `readme.md` foi alinhado ao estado real atual, mas deve continuar sendo revisado quando novos modulos entrarem
- `.env.example` ja foi alinhado com `DATABASE_URL_TEST`, mas futuras mudancas de env devem atualizar exemplo e documentacao juntos
- o script `start` ja foi alinhado ao output atual do build; se a estrutura de compilacao mudar, revisar `package.json`
- havia um BOM em `tsconfig.json` que quebrava o `tsc-alias`; isso foi corrigido e deve ser evitado em edicoes futuras
- existe pequena inconsistencia de desenho interno: nem todos os services seguem o mesmo nivel de desacoplamento dos repositories/factories, por exemplo `createMember.service.ts` usa `db` global e `getMe.service.ts` depende de implementacao concreta
- `drizzle.config.ts` agora resolve corretamente `DATABASE_URL_TEST` em ambiente de teste; futuras mudancas de env devem preservar esse comportamento para migrations locais

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

- mapa de assentos
- reservas concorrentes
- pedidos e checkout
- tickets e check-in
- filas e jobs assincronos em producao
- documentacao OpenAPI consistente
- storage de arquivos em producao
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
- criacao ou revisao relevante de specs em `specs/`
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

Baseado no estado atual do repositorio em `Thu Apr 23 2026`, ja considerando a leitura operacional inicial do modulo `session-seats`.
