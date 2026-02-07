# 🎬 CineSaaS — Backend (SaaS Multi-Tenant)

Backend de um **SaaS multi-tenant para cinemas**, desenvolvido com foco em **arquitetura backend de nível profissional**, boas práticas e **padrões usados em sistemas reais de produção**.

Este projeto foi pensado como **portfólio avançado**, abordando desde **fundação arquitetural**, passando por **autenticação moderna**, **multi-tenant**, **concorrência**, até **observabilidade, CI/CD e IA aplicada (RAG)**.

---

## 🚀 Visão Geral

O **CineSaaS** permite que **vários cinemas (tenants)** utilizem a mesma aplicação para:

- gerenciar usuários e permissões
- cadastrar filmes, salas e sessões
- reservar assentos com segurança
- vender ingressos
- validar tickets (check-in)
- operar com isolamento total de dados
- oferecer **suporte por IA isolado por tenant**

Tudo isso com uma arquitetura **preparada para escalar**, evoluir e ser mantida em produção.

---

## 🧠 Diferenciais Técnicos

- ✅ **Multi-tenant real**, não apenas “flag no banco”
- ✅ **Arquitetura modular orientada a domínio**
- ✅ **JWT + Refresh Token** com persistência e hash
- ✅ **Transações explícitas** para operações críticas
- ✅ **Testes E2E com banco real**
- ✅ **Separação clara de responsabilidades**
- ✅ Base preparada para **concorrência, cache e IA**

> Este projeto prioriza **clareza arquitetural e decisões conscientes**, não apenas features.

---

## 🧱 Arquitetura

Arquitetura inspirada em **Clean Architecture**, adaptada para SaaS:

HTTP (Fastify)
↓
Controllers (HTTP + validação)
↓
Services (casos de uso / regras de negócio)
↓
Repositories (Drizzle ORM)
↓
PostgreSQL (schemas por domínio)


### Decisões importantes

- **PostgreSQL com schemas por domínio**
- **Multi-tenant explícito** via `tenant_id`
- **Migrations versionadas** com Drizzle
- **Controllers finos**, regras nos services
- **Infra desacoplada do domínio**
- Testes pensados desde o início

---

## 🧩 Roadmap de Módulos

### ✅ Módulo 0 — Foundation (concluído)
Base profissional do projeto:
- Node.js + TypeScript
- Fastify
- Docker + PostgreSQL
- Drizzle ORM + migrations
- Logger estruturado
- Error handler global
- Healthcheck (`/health`)
- Graceful shutdown

---

### 🚧 Módulo 1 — IAM / Auth (em andamento)
Autenticação e identidade:
- Multi-tenant (`tenants`, `users`, `memberships`)
- JWT (access token)
- Refresh token persistido com hash
- Factories para injeção de dependências
- Controllers REST
- Testes E2E com banco real
- Tratamento completo de erros HTTP
- 🔜 Refresh token com rotação
- 🔜 Logout
- 🔜 Migração de hash para **Argon2**

---

### 🔜 Próximos módulos (planejados)

- Multi-tenant & RBAC (middlewares e roles)
- Catálogo (filmes, salas)
- Programação (sessões)
- Assentos e reservas com concorrência
- Pedidos e checkout
- Tickets e check-in
- **Chatbot com IA (RAG multi-tenant)**
- Cache, filas e observabilidade
- CI/CD e deploy automatizado

---

## 🛠️ Stack Tecnológica

- **Node.js + TypeScript**
- **Fastify**
- **PostgreSQL 18**
- **Drizzle ORM**
- **Docker & Docker Compose**
- **Zod**
- **JWT + Refresh Token**
- **Vitest + Supertest**
- **Redis** (planejado)
- **pgvector** (IA / embeddings)

---

## 🧪 Estado do Projeto

Projeto em **desenvolvimento ativo**, com foco em:

- aprendizado profundo
- decisões arquiteturais reais
- código legível e testável
- práticas próximas de produção

Commits refletem **evolução incremental**, não soluções “mágicas”.

---

## 🎯 Objetivo

Este projeto serve como:

- **portfólio backend avançado**
- **laboratório de arquitetura SaaS**
- base para estudos de:
  - autenticação moderna
  - multi-tenant
  - concorrência
  - observabilidade
  - integração com IA

---

## 👤 Autor

**Felipe Sakai**  
Desenvolvedor Backend  