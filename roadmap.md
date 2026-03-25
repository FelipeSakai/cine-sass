# CineSaaS - Roadmap realista de estudo

Este roadmap existe para guiar o aprendizado e a evolucao do projeto de forma honesta.

Ele nao deve ser lido como promessa de feature pronta. Ele deve refletir:

- o que ja foi implementado de verdade
- o que ainda esta parcial
- o que vem a seguir para maximizar aprendizado tecnico
- a ordem em que os modulos fazem mais sentido dentro de um backend SaaS multi-tenant

Contexto: este e um projeto de estudos com ambicao de parecer um backend profissional. Entao o roadmap deve priorizar aprendizado deliberado, clareza arquitetural, uso profissional das tecnologias e evolucao incremental.

---

## Principio central deste projeto

Este projeto existe antes de tudo para aprendizado aplicado.

O objetivo principal nao e construir um SaaS ultra endurecido em cada detalhe antes de avancar. O foco real e:

- aprender tecnologias novas de forma pratica
- aplicar essas tecnologias dentro de um sistema com cara de produto real
- exercitar decisoes arquiteturais proximas do mundo profissional
- evoluir por modulos que ensinem habilidades diferentes
- manter qualidade suficiente para portfolio e estudo serio, sem cair em sofisticacao prematura

Em outras palavras:

- o projeto deve parecer profissional
- a implementacao deve ser honesta e organizada
- mas a prioridade e aprendizado deliberado, nao perfeccionismo operacional

Isso significa que, em varios momentos, sera aceitavel deixar:

- coberturas incompletas
- edge cases nao totalmente exauridos
- observabilidade parcial
- refactors arquiteturais para depois
- endurecimento de seguranca apenas no nivel necessario para sustentar o proximo aprendizado

Regra pratica:

cada fase precisa ficar boa o bastante para suportar a proxima com clareza, e nao necessariamente exaustiva em nivel de producao real.

Outra regra importante: este roadmap precisa ter fim.

O objetivo nao e transformar o projeto em uma colecao infinita de tecnologias. Novas fases so devem entrar quando:

- reforcam o aprendizado de backend dentro do contexto do produto
- conversam com o dominio do cinema e do SaaS multi-tenant
- adicionam experiencia pratica reutilizavel em outros projetos
- nao desviam o foco para complexidade desproporcional

Quando uma tecnologia for interessante, mas pedir um salto grande demais de escopo, ela deve ficar para um projeto futuro.

---

## Principios do roadmap

- cada modulo deve ensinar uma habilidade tecnica principal
- cada entrega deve deixar o sistema em um estado coerente
- nao avancar para features de produto sem uma base minima confiavel
- preservar multi-tenancy explicito e arquitetura modular
- preferir consolidacao suficiente para aprender bem, sem travar a evolucao por excesso de endurecimento

---

## Leitura do estado atual

Hoje o projeto esta assim:

- modulo 0 (`Foundation`) concluido
- modulo 1 (`Auth & Users`) bem avancado
- modulo 2 (`Multi-tenant & RBAC`) iniciado na pratica e parcialmente implementado
- ainda nao existe modulo funcional de catalogo, sessoes, assentos, reservas, pedidos ou tickets

Isso significa que o roadmap antigo estava correto como intencao, mas desatualizado como retrato do estado atual.

---

## Tecnologias previstas no roadmap

Esta secao existe para te lembrar quais tecnologias voce pretende estudar e em que partes elas provavelmente entram.

Ela nao significa que tudo isso ja esta no projeto hoje.

### Ja em uso

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Drizzle ORM
- Zod
- Pino
- Vitest
- Supertest

### Previstas para as proximas fases

- Redis: cache, invalidacao e possivelmente apoio a fluxos temporarios
- BullMQ ou equivalente: filas e jobs assincronos com workers
- pgvector: embeddings e busca vetorial para a fase de IA
- Dockerfile multi-stage: empacotamento da aplicacao
- GitHub Actions: pipeline de CI/CD
- OpenTelemetry ou stack equivalente: tracing e observabilidade

### Mapeamento rapido por fase

- Fase 3 e Fase 5: Drizzle + PostgreSQL para modelagem forte de dominio
- Fase 4: client HTTP externo, timeout, retry controlado e Redis para cache
- Fase 6: PostgreSQL com foco em transacao, lock e consistencia
- Fase 8: Redis + BullMQ ou equivalente para jobs e filas
- Fase 10: Pino, metricas e OpenTelemetry ou equivalente
- Fase 11: Redis e analise de performance
- Fase 12: pgvector + modelo de embeddings + integracao com LLM
- Fase 13: Docker + GitHub Actions + deploy automatizado

Observacao importante: se no futuro voce mudar a stack planejada, atualize esta secao antes de comecar a implementacao para ela continuar servindo como memoria de estudo.

---

## Fase 0 - Foundation

Status: concluido

### Objetivo de estudo

Arquitetura base, setup profissional, qualidade minima de execucao e organizacao do projeto.

### Ja implementado

- Node.js + TypeScript + Fastify
- organizacao modular por dominio
- configuracao de env com Zod
- logger estruturado
- error handler global
- Drizzle ORM + migrations
- seed inicial
- healthcheck
- conexao PostgreSQL com pool
- graceful shutdown
- testes base com Vitest

### Pendencias pequenas de consolidacao

- alinhar docs com o estado real da foundation
- corrigir detalhes de DX e execucao local
- revisar scripts e exemplos de ambiente

### Aprendizados deste modulo

- bootstrap de backend Node.js profissional
- separacao entre app, infra e dominio
- uso de migrations e config segura por ambiente

---

## Fase 1 - IAM / Auth

Status: avancado

### Objetivo de estudo

Autenticacao moderna, identidade, sessoes e fluxos de seguranca basicos.

### Ja implementado

- criacao de tenant com owner inicial
- login com email e senha
- JWT access token
- refresh token persistido com hash
- refresh token com rotacao
- logout por revogacao
- endpoint `/me`
- factories para composicao de dependencias
- testes E2E relevantes do fluxo principal

### O que ainda vale aprender aqui antes de encerrar o modulo

- fortalecer cenarios negativos de auth em testes
- padronizar melhor contratos de erro
- revisar consistencia entre services e repositories
- eventualmente adicionar auditoria minima de eventos de autenticacao

### Entrega alvo para considerar este modulo consolidado

- fluxo de autenticacao confiavel
- testes cobrindo casos felizes e principais falhas
- documentacao alinhada com o codigo

### Aprendizados deste modulo

- JWT na pratica
- refresh token rotation
- hash de senha e hash de token
- desenho de fluxos de sessao em API stateless

---

## Fase 2 - Multi-tenant & RBAC

Status: parcial

### Objetivo de estudo

Isolamento real entre tenants, autorizacao por contexto e modelagem SaaS.

### Ja implementado

- tenants
- memberships
- roles `OWNER`, `ADMIN`, `STAFF`, `VIEWER`
- `requireAuth`
- `requireTenant` por header `x-tenant-id`
- `requireRole`
- endpoints protegidos de validacao
- criacao e listagem de membros

### O que falta para consolidar a fase

- ampliar testes de isolamento por tenant
- ampliar testes e regras de `/members`
- revisar edge cases de autorizacao
- definir com mais clareza contratos de contexto do tenant para futuros modulos

### Entrega alvo

- tenant context confiavel e reutilizavel
- regras de role suficientemente testadas
- base pronta para modulos de negocio reais

### Aprendizados deste modulo

- modelagem de membership
- isolamento de dados em SaaS
- autorizacao contextual por request

---

## Fase 3 - Catalogo interno

Status: planejado

### Objetivo de estudo

Modelagem de entidades de negocio, relacionamentos e CRUD com regras reais.

### Escopo sugerido

- filmes do tenant
- salas do tenant
- sessoes do tenant
- paginacao, filtros e ordenacao
- validacoes de integridade por tenant

### O que voce aprende aqui

- modelagem relacional fora do modulo de auth
- convencoes para novos modulos
- queries mais ricas com Drizzle
- separacao entre regras de dominio e adaptacao HTTP

### Entrega alvo

- primeiro modulo de produto real do cinema funcionando
- listagem de sessoes por dia e tenant

---

## Fase 4 - Integracao externa de catalogo

Status: planejado

### Objetivo de estudo

Integracao com servico externo, resiliencia e fronteira entre sistema interno e dependencias externas.

### Escopo sugerido

- busca de filmes em API externa
- importacao para catalogo interno
- timeout e tratamento de falhas
- rate limiting basico
- cache para consultas externas

### O que voce aprende aqui

- clients HTTP e resiliencia
- desenho de anti-corruption layer simples
- cache orientado a leitura

### Entrega alvo

- importacao de filmes externos para o tenant

---

## Fase 4.5 - Contratos de API e documentacao viva

Status: planejado

### Objetivo de estudo

Aprender a tratar contrato de API como parte do produto, com schemas claros, documentacao viva e previsibilidade para consumo.

### Escopo sugerido

- documentacao OpenAPI das rotas principais
- reaproveitamento de schemas de validacao quando fizer sentido
- exemplos de request/response para os modulos centrais
- definicao mais clara dos contratos de erro

### O que voce aprende aqui

- desenho de API com contrato explicito
- documentacao util para frontend e integracoes
- consistencia entre validacao, resposta e documentacao

### Entrega alvo

- API principal documentada de forma navegavel e coerente

---

## Fase 5 - Assentos e mapa da sessao

Status: planejado

### Objetivo de estudo

Modelagem de estado, estrutura derivada e regras de disponibilidade.

### Escopo sugerido

- geracao de assentos por sala
- mapa de assentos por sessao
- estados de assento
- leitura eficiente de disponibilidade

### O que voce aprende aqui

- modelagem de estado de dominio
- estruturas derivadas por sessao
- preparacao para concorrencia real

### Entrega alvo

- mapa de assentos funcional por sessao

---

## Fase 6 - Reserva com concorrencia

Status: planejado

### Objetivo de estudo

Consistencia, transacao, lock, idempotencia parcial e tratamento de corrida.

### Escopo sugerido

- reserva temporaria de assentos
- expiracao de reserva
- prevencao de dupla reserva
- testes de concorrencia

### O que voce aprende aqui

- concorrencia no Postgres
- transacoes em fluxos criticos
- trade-offs entre simplicidade e consistencia

### Entrega alvo

- reservas seguras sob acesso concorrente

---

## Fase 7 - Pedidos e checkout

Status: planejado

### Objetivo de estudo

Fluxos financeiros simulados, idempotencia e confirmacao de operacoes.

### Escopo sugerido

- criacao de pedido
- fechamento de pedido a partir de reserva
- pagamento simulado
- `Idempotency-Key`
- confirmacao segura

### O que voce aprende aqui

- desenho de fluxo transacional maior
- idempotencia em endpoint critico
- separacao entre estado temporario e estado confirmado

### Entrega alvo

- nenhum pedido duplicado sob repeticao de request

---

## Fase 7.5 - Auditoria e eventos de dominio

Status: planejado

### Objetivo de estudo

Aprender rastreabilidade de mudancas importantes, eventos de negocio e historico minimo de operacoes sensiveis.

### Escopo sugerido

- trilha de auditoria para eventos importantes
- eventos simples de dominio em fluxos criticos
- consulta basica de historico por tenant
- registro de actor, contexto e timestamp

### O que voce aprende aqui

- auditabilidade de backend
- separacao entre estado atual e historico de eventos
- desenho de eventos uteis sem cair em event sourcing completo

### Entrega alvo

- eventos e auditoria minima para os fluxos principais do dominio

---

## Fase 8 - Filas e jobs assincronos

Status: planejado

### Objetivo de estudo

Aprender processamento assincrono, retries, idempotencia e separacao entre trabalho sincrono da API e execucao em background.

### Escopo sugerido

- expiracao automatica de reservas
- envio assincrono de confirmacoes
- geracao de tickets em background
- processamento de eventos internos simples
- jobs agendados ou recorrentes quando fizer sentido
- retry controlado para falhas transientes

### O que voce aprende aqui

- quando usar fila em vez de request sincrona
- workers e jobs em arquitetura de backend
- idempotencia em processamento assincrono
- retry, falha transiente e consistencia eventual
- desenho de fluxos mais proximos de sistemas reais

### Tecnologias sugeridas

- Redis
- BullMQ ou equivalente
- PostgreSQL como fonte principal de verdade
- eventualmente Outbox Pattern em versao simples

### Entrega alvo

- pelo menos um fluxo real operando com API + persistencia + job + worker
- um caso concreto de processamento assincrono justificavel dentro do dominio

---

## Fase 9 - Tickets e check-in

Status: planejado

### Objetivo de estudo

Validacao operacional, auditoria e regras de consumo de ingresso.

### Escopo sugerido

- emissao de ticket
- validacao de ticket
- check-in
- trilha de auditoria minima

### O que voce aprende aqui

- identificadores de negocio
- validacao de uso unico
- registro auditavel de eventos

### Entrega alvo

- check-in seguro e rastreavel

---

## Fase 10 - Observabilidade

Status: planejado

### Objetivo de estudo

Diagnostico de aplicacao, visibilidade operacional e maturidade tecnica.

### Escopo sugerido

- logs estruturados melhores
- correlation id ou request id
- metricas basicas
- tracing basico ou instrumentacao equivalente

### O que voce aprende aqui

- visibilidade de producao
- analise de gargalos e erros
- operacao de backend mais profissional

### Entrega alvo

- sinais suficientes para entender comportamento da aplicacao

---

## Fase 11 - Cache & performance

Status: planejado

### Objetivo de estudo

Reducao de custo de leitura, invalidacao e analise de gargalos.

### Escopo sugerido

- Redis
- cache de sessoes e consultas externas
- invalidacao simples e explicita
- comparacao de performance antes e depois

### O que voce aprende aqui

- quando cache ajuda de verdade
- riscos de consistencia
- desenho de invalidacao sem magia

### Entrega alvo

- ganhos reais em rotas selecionadas

---

## Fase 11.5 - Storage e arquivos

Status: planejado

### Objetivo de estudo

Aprender upload, armazenamento, validacao e metadados de arquivos em fluxos comuns de backend.

### Escopo sugerido

- upload de poster de filme ou asset simples do catalogo
- validacao de tipo e tamanho
- persistencia de metadados
- estrategia simples de armazenamento local ou provider compativel

### O que voce aprende aqui

- tratamento de arquivos em APIs
- separacao entre metadado e binario
- preocupacoes praticas de armazenamento e seguranca basica

### Entrega alvo

- pelo menos um fluxo de upload e leitura de arquivo integrado ao dominio

---

## Fase 12 - IA aplicada ao SaaS

Status: planejado

### Objetivo de estudo

RAG multi-tenant com isolamento e integracao segura ao dominio.

### Escopo sugerido

- base de conhecimento por tenant
- ingestao de documentos
- embeddings
- pgvector
- pipeline de recuperacao
- respostas com fontes
- auditoria e rate limiting

### O que voce aprende aqui

- IA integrada a sistema real
- isolamento de contexto por tenant
- arquitetura para RAG sem perder governanca

### Entrega alvo

- chatbot funcional isolado por tenant

---

## Fase 13 - CI/CD & deploy

Status: planejado

### Objetivo de estudo

Fechar o ciclo de engenharia ate entrega e operacao.

### Escopo sugerido

- Dockerfile multi-stage
- pipeline de testes
- build automatizado
- migrations em ambiente alvo
- deploy automatizado

### O que voce aprende aqui

- esteira minima de entrega
- preocupacoes de ambiente real
- confiabilidade operacional

### Entrega alvo

- projeto publicavel com pipeline clara

---

## Ordem sugerida daqui para frente

Para maximizar aprendizado tecnico sem perder coerencia de sistema, a ordem mais forte daqui em diante e:

1. consolidar Fase 1 e Fase 2
2. construir Catalogo interno
3. consolidar contratos de API e documentacao viva
4. integrar provider externo
5. modelar assentos
6. enfrentar concorrencia nas reservas
7. implementar pedidos e checkout
8. adicionar auditoria e eventos de dominio
9. adicionar filas e jobs assincronos
10. gerar tickets e check-in
11. adicionar observabilidade
12. adicionar cache/performance
13. adicionar storage de arquivos
14. explorar IA com RAG multi-tenant
15. fechar com CI/CD e deploy

Essa ordem faz sentido porque prioriza aprendizado progressivo:

- primeiro dominio e modelagem
- depois contratos de API mais claros
- depois integracao externa
- depois consistencia e concorrencia
- depois auditabilidade
- depois processamento assincrono
- depois operacao, performance, storage e IA

A prioridade aqui nao e blindar cada fase ao maximo antes da seguinte.

A prioridade e chegar a um nivel suficientemente profissional para que cada modulo:

- faca sentido arquiteturalmente
- ensine uma tecnologia ou habilidade nova
- deixe o sistema pronto para o proximo passo

Tecnologias interessantes que ficaram propositalmente fora deste roadmap principal, para evitar escopo infinito:

- microservices
- Kubernetes
- CQRS pesado
- event sourcing completo
- service mesh

Esses temas podem virar projetos futuros quando o objetivo for estudar distribuicao, orquestracao ou arquiteturas mais avancadas sem sobrecarregar este repositorio.

---

## Janela de conclusao sugerida

Para manter este projeto finito e com boa energia de execucao, a janela mais saudavel para concluir o roadmap principal e entre 4 e 6 meses.

Leitura pratica:

- 2 a 3 meses: ritmo forte, com bastante frequencia e pouca dispersao
- 4 meses: alvo recomendado para manter foco e ainda absorver bem o aprendizado
- 5 a 6 meses: ritmo mais confortavel, ainda valido sem deixar o projeto eterno
- mais de 6 meses: aumenta o risco de perda de foco, inflacao de escopo e fadiga

Este prazo considera que nem toda fase precisa ser exaustiva. O objetivo e concluir o projeto principal com versoes suficientemente boas, coerentes e didaticas dos modulos planejados.

### Cronograma sugerido

#### Mes 1

- consolidar minimamente Fase 1 e Fase 2
- iniciar e fechar o nucleo da Fase 3
- avancar na Fase 4.5 com contratos principais da API

#### Mes 2

- avancar na Fase 5
- implementar o nucleo da Fase 6
- iniciar a Fase 8 com o fluxo principal de pedidos

#### Mes 3

- consolidar Fase 8
- implementar Fase 8.5
- implementar Fase 9 com pelo menos um fluxo assincrono real
- avancar na Fase 10

#### Mes 4

- consolidar Fase 10
- implementar Fase 11
- implementar Fase 12 em versao enxuta
- avancar em Fase 12.5, Fase 13 e fechamento do projeto

### Regra de acompanhamento

Se alguma fase comecar a crescer demais, reduzir escopo antes de abrir novas frentes.

O objetivo nao e completar todas as ideias possiveis. O objetivo e terminar um backend de estudos serio, coerente e publicavel, com boa variedade de tecnologias aplicadas.

---

## Criterio de atualizacao deste documento

Atualizar este roadmap sempre que:

- um modulo mudar de status
- o escopo de um modulo mudar de forma relevante
- surgir um novo objetivo de estudo mais importante que os anteriores
- a ordem dos modulos deixar de fazer sentido

Em caso de conflito, o codigo implementado vale mais que este roadmap.
