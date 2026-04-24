# Session Seats Module Spec

## Objetivo

Esta spec define a proxima entrega de dominio apos a primeira versao funcional de `sessions`.

O objetivo do modulo de mapa de assentos por sessao e transformar o `room_layout_snapshot` ja persistido em uma estrutura operacional de disponibilidade por sessao, sem ainda implementar a reserva concorrente completa.

Em outras palavras, esta fase existe para sair de uma sessao apenas agendada para uma sessao com assentos enderecaveis e estado proprio.

Ela prepara a cadeia real do produto:

`movie -> room -> session -> session seat map -> reservation -> order -> ticket`

## Direcao estrategica

Esta entrega deve preservar as decisoes arquiteturais atuais do projeto:

- multi-tenancy explicito por `x-tenant-id`
- controllers finos
- regras de negocio nos services
- repositories encapsulando acesso ao banco
- Postgres como fonte central de verdade
- evolucao incremental, sem antecipar uma engine completa de reservas

O modulo nao deve tentar resolver ainda:

- hold temporario com expiracao automatica
- checkout
- emissao de ticket
- jobs assincronos
- lock distribuido
- eventos de dominio sofisticados

O foco desta fase e criar a base correta de enderecamento de assentos por sessao e consulta de disponibilidade.

## Por que esta fase vem agora

- `rooms` ja define o layout-base da sala
- `sessions` ja persiste `room_layout_snapshot` no momento da criacao
- o proximo aprendizado natural do dominio e sair do template da sala para o estado concreto da sessao
- reservas com concorrencia ficam muito mais claras quando a sessao ja possui assentos materializados e identificaveis

Sem esta etapa, a fase de reservas tende a misturar duas responsabilidades ao mesmo tempo:

- derivar os assentos da sessao
- concorrer por esses assentos

Separar essas responsabilidades mantem a evolucao mais didatica e mais limpa.

## Escopo desta entrega

### Em escopo

- materializar um mapa de assentos por sessao a partir de `room_layout_snapshot`
- definir identidade estavel de assento dentro da sessao
- permitir consulta do mapa de assentos da sessao
- expor disponibilidade basica por assento
- suportar bloqueio manual de assentos indisponiveis para a sessao
- manter o fluxo totalmente tenant-scoped
- cobrir caminho feliz e principais falhas com testes E2E

### Fora de escopo agora

- reserva temporaria por usuario
- expiracao automatica de hold
- pagamento
- carrinho
- overbooking intencional
- precificacao por assento
- upgrade/downgrade automatico de assento
- remapeamento automatico quando a sala muda depois da sessao criada
- reprocessamento em massa de mapas antigos

## Tasks da entrega

Esta fase fica mais clara se for tratada como uma sequencia curta de tasks independentes, mas encadeadas.

## Status atual

Estado da implementacao no momento:

- `Task 1` concluida
- `Task 2` concluida
- `Task 3` concluida
- `Task 4` ainda nao iniciada

O que ja existe no codigo:

- tabela `catalog.session_seats`
- enum `session_seat_status`
- modulo proprio `src/modules/session-seats`
- materializacao de assentos ativos durante a criacao da sessao
- persistencia de `seat_key`, `row_label`, `seat_number`, `seat_type` e status inicial `AVAILABLE`
- `GET /sessions/:sessionId/seats` com resumo agregado por status
- `PATCH /sessions/:sessionId/seats/:seatId/block`
- `PATCH /sessions/:sessionId/seats/:seatId/unblock`
- testes E2E cobrindo materializacao, leitura, filtragem de assentos inativos, resumo, transicoes de status, RBAC e congelamento apos alteracao da sala

Ponto de parada para retomar depois:

- proxima implementacao prevista: `Task 4`, para explicitar o tratamento de sessoes legadas sem mapa materializado

## Task 1: Materializacao estrutural dos assentos da sessao

Objetivo:

- transformar `room_layout_snapshot` em registros persistidos de `session_seats`

Inclui:

- criar a tabela `catalog.session_seats`
- derivar apenas assentos ativos do snapshot
- persistir identidade estavel por `seat_key`
- executar a materializacao na mesma transacao de criacao da sessao

Nao inclui:

- endpoint publico de leitura do mapa
- bloqueio manual
- reserva concorrente

Definition of done sugerida:

- toda nova sessao nasce com seus assentos materializados
- assentos inativos do snapshot nao sao persistidos
- editar a sala depois nao altera os assentos da sessao ja criada

Status de implementacao:

- concluida

## Task 2: Leitura do mapa de assentos da sessao

Objetivo:

- expor consulta operacional do mapa da sessao

Inclui:

- `GET /sessions/:sessionId/seats`
- ordenacao canonica por fileira e numero
- resumo agregado por status
- isolamento estrito por tenant

Nao inclui:

- mudanca de status
- reserva
- filtros complexos ou paginacao

Definition of done sugerida:

- o endpoint retorna todos os assentos da sessao no tenant correto
- a resposta traz `summary.total`, `summary.available`, `summary.blocked` e `summary.reserved`
- sessoes de outro tenant nao vazam dados

Status de implementacao:

- concluida

## Task 3: Bloqueio operacional manual

Objetivo:

- permitir indisponibilizar assentos por decisao operacional sem entrar ainda em reserva concorrente

Inclui:

- `PATCH /sessions/:sessionId/seats/:seatId/block`
- `PATCH /sessions/:sessionId/seats/:seatId/unblock`
- validacao de transicao de status
- autorizacao de escrita para `OWNER`, `ADMIN` e `STAFF`

Nao inclui:

- expiracao automatica
- ownership por usuario
- trilha completa de auditoria

Definition of done sugerida:

- apenas `AVAILABLE` vira `BLOCKED`
- apenas `BLOCKED` volta para `AVAILABLE`
- tentativas invalidas retornam erro de regra de negocio previsivel

Status de implementacao:

- concluida

## Task 4: Compatibilidade com sessoes ja existentes

Objetivo:

- decidir e documentar o tratamento de sessoes criadas antes da feature

Opcoes validas:

- backfill simples para ambiente de desenvolvimento
- assumir que apenas novas sessoes terao mapa materializado

Minha recomendacao:

- implementar a feature para novas sessoes imediatamente
- deixar um utilitario simples de backfill documentado se isso realmente atrapalhar o fluxo local

Definition of done sugerida:

- a decisao escolhida fica explicita na implementacao, nos testes e na documentacao

## Papel do modulo no sistema

O modulo de `session seats` deve representar a configuracao operacional de assentos de uma sessao especifica.

Enquanto `rooms` continua sendo o template reutilizavel da sala, `session seats` passa a representar a realidade daquela exibicao especifica.

Isso significa que futuras mudancas no layout da sala nao alteram o mapa ja consolidado da sessao.

## Modelo de dominio recomendado

### Entidade `session_seat`

Campos recomendados para a primeira versao:

- `id`
- `tenant_id`
- `session_id`
- `seat_key`
- `row_label`
- `seat_number`
- `seat_type`
- `status`
- `is_accessibility_seat`
- `created_at`
- `updated_at`

### Identidade do assento

Cada assento da sessao precisa ter duas formas de identidade:

- `id`: chave tecnica do registro
- `seat_key`: chave de dominio legivel e estavel, derivada de `row_label + seat_number`

Exemplo:

- `A-1`
- `A-2`
- `B-10`

Diretriz recomendada:

- `seat_key` deve ser unico dentro da sessao
- o sistema deve persistir `row_label` e `seat_number` separadamente para facilitar leitura, ordenacao e futuras regras
- a identidade do assento deve vir exclusivamente do snapshot da sessao, nunca da sala atual

### Status iniciais

Primeiro conjunto recomendado:

- `AVAILABLE`
- `BLOCKED`
- `RESERVED`

Regras da primeira entrega:

- todo assento ativo do snapshot nasce como `AVAILABLE`
- bloqueios operacionais manuais podem mudar para `BLOCKED`
- `RESERVED` existe no modelo desde ja porque sera usado imediatamente na fase seguinte, mas nesta entrega ele pode aparecer apenas por preparacao de contrato e testes pontuais controlados

Observacao importante:

- se voce preferir manter o MVP ainda mais estreito, a implementacao inicial pode usar apenas `AVAILABLE` e `BLOCKED`, deixando `RESERVED` ja documentado para a fase seguinte
- minha recomendacao de spec e manter `RESERVED` no modelo desde agora para evitar retrabalho de contrato logo na fase seguinte

## Fonte de verdade do mapa

O mapa de assentos da sessao deve ser derivado de `sessions.room_layout_snapshot`.

Regra central:

- somente assentos marcados como ativos no snapshot devem gerar `session_seats`

Consequencias:

- assentos inativos do layout da sala nao entram no mapa da sessao
- editar a sala depois nao altera os assentos ja gerados para sessoes existentes
- o mapa da sessao continua deterministico e auditavel

## Estrategia de materializacao

### Recomendacao principal

Materializar os assentos no momento da criacao da sessao.

Fluxo recomendado:

1. criar a sessao com `room_layout_snapshot`
2. derivar os assentos ativos do snapshot
3. inserir `session_seats` na mesma transacao

Motivacao:

- evita reconstruir o mapa a cada leitura
- prepara o banco para regras futuras de concorrencia por assento
- deixa o contrato de disponibilidade claro e direto
- facilita bloqueios operacionais e futuras reservas

### Alternativa rejeitada para agora

Derivar o mapa dinamicamente em toda leitura a partir do snapshot JSON.

Por que nao seguir esse caminho:

- empurra a complexidade para a fase de reserva
- dificulta persistencia de estado por assento
- mistura leitura estrutural e estado operacional

## Regras de negocio principais

### Integridade por tenant

Toda leitura e escrita deve ser tenant-scoped.

Regras obrigatorias:

- a sessao consultada deve pertencer ao tenant ativo
- assentos consultados devem sempre ser filtrados por `tenant_id` e `session_id`
- bloqueios operacionais devem atuar apenas sobre assentos da sessao do tenant ativo

### Congelamento estrutural

Depois de criada a sessao, o conjunto base de assentos daquela sessao nao deve ser regenerado automaticamente.

Regra recomendada:

- o sistema nao deve sincronizar `session_seats` com alteracoes posteriores em `catalog.rooms`

Se futuramente houver necessidade de rematerializacao, isso deve existir como fluxo explicito e excepcional, nao como comportamento automatico.

### Ordenacao canonica

As leituras do mapa devem ser retornadas de forma previsivel.

Recomendacao:

- ordenar por `row_label` ascendente
- dentro da fileira, ordenar por `seat_number` ascendente

### Bloqueio operacional manual

Esta fase pode incluir um bloqueio simples de assentos indisponiveis para manutencao, defeito ou operacao interna.

Regra recomendada:

- apenas assentos `AVAILABLE` podem ir para `BLOCKED`
- um assento `BLOCKED` pode voltar para `AVAILABLE`
- assentos `RESERVED` nao podem ser desbloqueados por esse fluxo operacional sem uma regra explicita futura

Isto mantem a regra simples e evita conflitar com a fase seguinte de reservas.

## Estrategia de modelagem de dados

### Tabela recomendada

Adicionar `catalog.session_seats`.

Shape sugerido para a primeira versao:

- `id` UUID primary key
- `tenant_id` FK para `iam.tenants`
- `session_id` FK para `catalog.sessions`
- `seat_key` text
- `row_label` text
- `seat_number` integer
- `seat_type` text
- `status` text ou enum simples
- `is_accessibility_seat` boolean default false
- `created_at` timestamp with timezone
- `updated_at` timestamp with timezone

### Restricoes e indices recomendados

- unique `(session_id, seat_key)`
- indice por `tenant_id`
- indice por `session_id`
- indice composto por `(tenant_id, session_id)`
- opcionalmente indice composto por `(session_id, status)` para futuras consultas de disponibilidade

Observacao:

- `tenant_id` em `session_seats` pode parecer redundante porque a sessao ja possui tenant, mas vale a pena nesta fase para manter filtros simples, coerentes e explicitos com o resto do projeto

## Contratos de persistencia sugeridos

Capacidades minimas esperadas para o repository:

- criar assentos da sessao em lote
- listar assentos por sessao e tenant
- buscar assento por `id` ou `seat_key` dentro da sessao
- atualizar status do assento
- contar assentos por status da sessao

Evitar nesta fase:

- repository generico demais
- metodos que tentem antecipar toda a fase de reserva
- query builders vazando para os services

## Estrutura modular recomendada

Seguir o padrao canonico atual do projeto:

- `src/modules/session-seats/domain/`
- `src/modules/session-seats/dtos/`
- `src/modules/session-seats/factories/`
- `src/modules/session-seats/http/controllers/`
- `src/modules/session-seats/http/routes/`
- `src/modules/session-seats/http/tests/`
- `src/modules/session-seats/services/`
- `src/modules/session-seats/repositories/contracts.ts`
- `src/modules/session-seats/repositories/drizzle/`

Arquivos provaveis da primeira entrega:

- `session-seat-status.ts`
- `materialize-session-seats.service.ts`
- `list-session-seats.service.ts`
- `block-session-seat.service.ts`
- `unblock-session-seat.service.ts`
- `list-session-seats.controller.ts`
- `block-session-seat.controller.ts`
- `unblock-session-seat.controller.ts`
- `session-seats.routes.ts`
- `catalog-session-seats.repository.ts`

Observacao de modularidade:

- se voce quiser manter o numero de modulos menor, tambem e defensavel tratar `session seats` como subdominio de `sessions`
- ainda assim, minha recomendacao e modulo proprio porque o proximo passo de reservas tendera a girar fortemente em torno desses assentos

## Integracao com `sessions`

Existem dois caminhos validos.

### Caminho recomendado

Materializar `session_seats` durante `create-session.service.ts`.

Vantagens:

- mantem a sessao sempre pronta para consulta operacional
- evita endpoint ou job de backfill para sessoes novas
- facilita garantir transacao unica entre sessao e seus assentos

### Caminho alternativo

Criar um service dedicado chamado logo apos a sessao ser criada.

Esse caminho so vale a pena se voce quiser manter o service de `sessions` menor e explicitamente delegar a materializacao para outro modulo.

Minha recomendacao pratica:

- delegar a logica de derivacao para um service do modulo `session-seats`
- chamar esse service dentro da transacao de criacao da sessao

Assim voce preserva separacao de responsabilidade sem abrir mao de atomicidade.

## Direcao HTTP recomendada

Rotas iniciais sugeridas:

- `GET /sessions/:sessionId/seats`
- `PATCH /sessions/:sessionId/seats/:seatId/block`
- `PATCH /sessions/:sessionId/seats/:seatId/unblock`

### `GET /sessions/:sessionId/seats`

Responsabilidade:

- retornar o mapa operacional de assentos da sessao

Resposta sugerida:

```json
{
  "sessionId": "uuid",
  "summary": {
    "total": 120,
    "available": 118,
    "blocked": 2,
    "reserved": 0
  },
  "seats": [
    {
      "id": "uuid",
      "seatKey": "A-1",
      "rowLabel": "A",
      "seatNumber": 1,
      "seatType": "STANDARD",
      "status": "AVAILABLE"
    }
  ]
}
```

### `PATCH /sessions/:sessionId/seats/:seatId/block`

Responsabilidade:

- marcar assento como indisponivel por decisao operacional

Nao precisa receber payload no MVP se a mudanca for apenas de status.

### `PATCH /sessions/:sessionId/seats/:seatId/unblock`

Responsabilidade:

- devolver um assento bloqueado ao estado `AVAILABLE`

## Autorizacao recomendada

Sugestao para a primeira versao:

- leitura do mapa: qualquer usuario autenticado com membership no tenant
- bloqueio e desbloqueio operacional: `OWNER`, `ADMIN`, `STAFF`

Isto preserva a mesma linha de autorizacao ja usada em `rooms` e `sessions`.

## Estrategia de erros

Casos principais esperados:

- sessao nao encontrada no tenant
- mapa de assentos nao materializado para a sessao
- assento nao encontrado na sessao
- tentativa de bloquear assento em status invalido
- tentativa de desbloquear assento em status invalido

Manter erros simples, orientados a regra de negocio e coerentes com o resto do projeto.

## Estrategia de migracao

Como o projeto ja possui `sessions` em funcionamento, esta entrega precisa considerar sessoes antigas existentes no banco.

Recomendacao:

- novas sessoes ja devem nascer com `session_seats` materializados
- para bases existentes de desenvolvimento, um script simples de backfill pode ser suficiente
- nao introduzir job recorrente ou mecanismo complexo de reconciliacao agora

Se quiser evitar trabalho de backfill neste momento, uma alternativa aceitavel e assumir que a feature vale apenas para sessoes criadas apos a migration, desde que isso fique explicito nos testes e docs.

Minha recomendacao pratica e documentar o backfill como utilitario simples, nao como parte central da arquitetura.

## Testes recomendados

Seguir a estrategia atual do projeto: foco em testes E2E com banco real.

Cobertura minima recomendada:

- cria sessao e materializa assentos ativos do snapshot
- nao materializa assentos inativos
- lista mapa da sessao no tenant correto
- isola mapa por tenant
- bloqueia assento `AVAILABLE`
- desbloqueia assento `BLOCKED`
- rejeita bloqueio para assento inexistente
- rejeita desbloqueio em estado invalido
- garante que alterar a sala depois nao muda assentos da sessao ja criada

Cobertura valiosa logo depois, mas nao obrigatoria na primeira entrega:

- validar ordenacao canonica do mapa
- validar contadores agregados por status
- backfill de sessoes legadas

## Decisoes que esta spec quer preservar

- o template da sala vive em `rooms`
- o estado operacional dos assentos vive na sessao
- assentos da sessao devem ser persistidos, nao recalculados em toda leitura
- o proximo passo de reservas deve operar sobre `session_seats`, nao sobre JSON cru do snapshot
- qualquer sofisticacao de concorrencia fica para a proxima fase, nao para esta

## Sequencia recomendada apos esta entrega

Depois desta fase, o proximo passo natural e `reservations` com foco em concorrencia.

Ate la, a base esperada deve estar pronta:

- mapa materializado por sessao
- identidade estavel por assento
- status operacional por assento
- endpoints de leitura e bloqueio basico

Com isso, a fase seguinte pode se concentrar no problema certo:

- disputa por assentos
- transacao
- idempotencia
- expiracao de hold
- consistencia sob concorrencia
