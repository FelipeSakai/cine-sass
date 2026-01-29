# 🎬 CineSaaS — Backend

Backend de um **SaaS multi-tenant para cinemas**, desenvolvido com foco em **arquitetura backend moderna**, boas práticas e **evolução incremental até produção**.

O projeto é construído **por módulos**, cada um com entregas bem definidas, abordando desde a fundação do sistema até autenticação, multi-tenant, reservas, vendas, filas, cache, observabilidade e CI/CD.

---

## 🚀 Visão Geral

O **CineSaaS** permite que **vários cinemas (tenants)** utilizem a mesma plataforma para:

* gerenciar usuários e permissões
* cadastrar filmes, salas e sessões
* reservar assentos
* vender ingressos
* validar tickets
* operar com segurança em ambiente de produção

Tudo isso mantendo **isolamento de dados por tenant** e uma arquitetura preparada para escalar.

---

## 🧱 Arquitetura

O projeto segue uma **arquitetura modular orientada a domínio**, inspirada em Clean Architecture:

```
HTTP (Fastify)
   ↓
Módulos de Domínio (IAM, Catalog, Schedule, ...)
   ↓
Infraestrutura (Postgres, Migrations, Cache, Fila)
```

### Principais decisões

* **PostgreSQL com schemas por domínio**
* **Multi-tenant explícito** via `tenant_id`
* **Migrations versionadas** com Drizzle
* **Controllers finos**, regras concentradas nos serviços
* Infra desacoplada do domínio

---

## 🧩 Módulos (Roadmap)

### ✅ Módulo 0 — Foundation (concluído)

* [x] Node.js + TypeScript
* [x] Scripts `dev`, `build`, `start`
* [x] Docker + PostgreSQL
* [x] Drizzle ORM + migrations
* [x] Primeira migration (pipeline validado)
* [x] Fastify com endpoint `/health`
* [x] Logger estruturado
* [x] Error handler global
* [x] Graceful shutdown

### 🚧 Módulo 1 — IAM (em andamento)

* [x] Modelagem multi-tenant (users, tenants, memberships)
* [x] Schema IAM separado por domínio
* [x] Migrations do IAM aplicadas
* [x] Seed inicial do IAM (tenant + owner)
* [x] Repositories do IAM (Drizzle)
* [ ] Services do IAM (casos de uso)
* [ ] Transações (operações atômicas)
* [ ] Controllers e rotas iniciais

### 🔜 Próximos módulos

* Catálogo (filmes, salas)
* Programação (sessões)
* Reservas (concorrência e expiração)
* Pedidos e checkout
* Tickets e check-in
* Suporte por IA (chatbot RAG multi-tenant)
* Integração com API externa de filmes
* Cache, filas e observabilidade
* CI/CD e deploy

---

## 🛠️ Stack Tecnológica

* **Node.js + TypeScript**
* **Fastify** — servidor HTTP
* **PostgreSQL 18** — banco de dados
* **Drizzle ORM** — schema e migrations
* **Docker & Docker Compose**
* **Zod** — validação (env e inputs)
* **Vitest** — testes (em breve)

---

## 🧪 Estado atual

Este projeto está em **desenvolvimento ativo** e segue uma abordagem **educacional + profissional**, com foco em aprendizado profundo de backend.

Commits e decisões são feitos de forma incremental e consciente, priorizando **entendimento antes de complexidade**.

---

## 🎯 Objetivo

Este projeto serve como:

* portfólio backend avançado
* laboratório de arquitetura SaaS
* base para estudos de produção (CI/CD, observabilidade, escalabilidade)

---

## 👤 Autor

**Felipe Sakai**
Desenvolvedor Backend

---
