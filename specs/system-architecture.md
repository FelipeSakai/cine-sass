# System Architecture Spec

## Purpose

This folder stores living specs that explain project-wide decisions for future agents and maintainers.

The first spec defines the canonical backend module structure so new modules follow one pattern instead of mixing local variations.

## Canonical Module Pattern

Every business module under `src/modules/<module>` should follow this structure:

```text
src/modules/<module>/
  domain/
  dtos/
  factories/
  http/
    controllers/
    middlewares/
    routes/
    tests/
  integrations/
    clients/
    mappers/
    providers/
  repositories/
    drizzle/
    contracts.ts
  services/
```

Notes:

- `domain/`: enums, value objects, domain rules, and central concepts.
- `dtos/`: service input/output contracts and transport-safe shapes.
- `factories/`: dependency composition for services and adapters.
- `http/controllers/`: thin HTTP adapters with validation and response mapping.
- `http/middlewares/`: auth, tenant, role, or other HTTP-specific guards.
- `http/routes/`: Fastify route registration only.
- `http/tests/`: E2E tests for the module.
- `integrations/`: external providers, HTTP clients, and mapping code when the module talks to outside systems.
- `repositories/contracts.ts`: repository interfaces and shared persistence types.
- `repositories/drizzle/`: Drizzle implementations of repository contracts.
- `services/`: use cases and business rules.

## Conventions

- Controllers stay thin.
- Business rules stay in services.
- Factories compose concrete dependencies.
- Route files live only in `http/routes/`.
- Repository contracts stay under `repositories/` and not mixed with HTTP files.
- Integrations are optional; only create them when the module talks to external systems.
- Empty folders may keep a `.gitkeep` while the module is still being built.

## Current Alignment

- `iam` is the reference implementation for the pattern.
- `movies` is kept as the scaffold for the next product module and now uses the same folder layout.

## Future Specs

New specs inside `specs/` should describe cross-cutting decisions, for example:

- multi-tenant rules
- auth/session flows
- API contract standards
- integration boundaries
- testing strategy
