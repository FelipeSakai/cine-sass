# Movies Module Spec

## Purpose

The `movies` module is the first product-facing module after IAM. It should stay coherent with the SaaS model while maximizing learning about external integrations and internal catalog design.

## Strategic Decision

`movies` is not a full manual movie registry.

The tenant movie catalog should be internal, but its source of truth for discovery comes from an external provider. In practice, the flow is:

1. search movies in an external API
2. choose a movie to import
3. persist a tenant-scoped internal movie record
4. use the internal movie id in future modules like sessions, seat maps, reservations, and tickets

This keeps the project realistic without turning movie management into a generic CRUD that teaches less.

## Why This Shape Makes Sense

- teaches HTTP integration with a real provider
- keeps the system independent from real-time dependency on the provider
- preserves tenant isolation
- gives stable internal ids for sessions and future business rules
- avoids overbuilding a backoffice for data that usually comes from external catalogs

## Initial Scope

- search external movies
- import one movie into the tenant catalog
- list imported movies for the tenant

## Deferred Scope

- full movie editing flows
- complex synchronization rules
- poster/file upload for movies
- advanced filtering and pagination

These can come later only if they become useful to the next learning phase.

## Internal Data Model

The internal catalog movie should store at least:

- tenant id
- title
- original title
- synopsis
- poster and backdrop URLs
- release date
- runtime minutes
- source provider
- source movie id
- import metadata snapshot

The same external movie may be imported by different tenants, so uniqueness should be tenant-scoped.

## Integration Boundary

The module should separate:

- provider client logic in `integrations/`
- import/search use cases in `services/`
- persistence contracts in `repositories/`

Future providers can reuse the same service flow as long as they implement the provider contract.

## Planned Use Cases

- `SearchExternalMoviesService`
- `ImportMovieService`
- `ListMoviesService`

This is enough to unlock the next modules without making the project infinite.
