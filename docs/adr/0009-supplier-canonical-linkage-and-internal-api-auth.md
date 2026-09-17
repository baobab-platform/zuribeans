# ADR 0009: Supplier canonical organisation linkage and internal API authentication

## Status

Accepted

## Context

Gate ZB-03 ("IAM and Isolation") built the buyer-side half of a cross-repo canonical identity
chain: `baobab-cp` now links a Keycloak Organization to a `CanonicalEntity`
(`POST /v1/canonical-entities/{entityID}/external-references`, ADR-BCP-016), and
`baobab-trade` now has a route to set `b2b_organisation.canonical_organisation_id`
(`POST /admin/b2b/organisations/{id}/canonical-link`) once linked.

Zuribeans' own `supplier_organisations.canonical_organisation_id`
(ADR-0006) is the supplier-side counterpart of that same seam — reserved from that ADR's
inception, but with no write path anywhere in this repository until now.

Unlike `baobab-trade`, Zuribeans has no admin/staff actor of its own to gate a new
admin-only route with:

- `baobab-trade`'s `POST /admin/b2b/organisations/{id}/canonical-link` is gated by Medusa's own
  `authenticate("user", ["session", "bearer"])` — Medusa's admin "user" actor, entirely separate
  from the "customer" actor buyers and suppliers authenticate as.
- `baobab-cp`'s equivalent route is gated by its own `Principal`/`requireAdminRole` chain.
- Zuribeans has neither. Its only auth primitive is the Medusa **customer** session
  (`src/lib/auth/customer.ts`), and its own Postgres/drizzle database
  (`src/lib/db/client.ts`) is deliberately separate from Medusa's — "never shared with, and
  never a copy of, any Baobab engine's database" (ADR-0006) — so there is no admin actor of
  either engine's reachable from a Zuribeans Server Action or Route Handler.

Building a full internal/staff identity system (a new IAM workload-token verifier, or a
Zuribeans-side admin session) is out of scope for wiring one reserved column — that would be
inventing infrastructure this repository does not otherwise need yet, the same kind of
premature coupling ADR-0006 already declined for ERP Business Partner mapping and event
publishing.

## Decision

- Add `setSupplierCanonicalOrganisationId` (`src/lib/supplier/repository.ts`): a plain
  `UPDATE ... WHERE id = ...` against the existing, previously-unwritten
  `canonical_organisation_id` column. Returns `null` for an unknown id rather than silently
  no-op-ing, so its caller can answer 404.
- Add `POST /api/admin/suppliers/{id}/canonical-link` (`src/app/api/admin/suppliers/[id]/
canonical-link/route.ts`) — Zuribeans' first admin-only backend route. An operator calls it
  after linking the same canonical identity to a `SUPPLIER_ORGANISATION` `CanonicalEntity` in
  `baobab-cp`.
- Gate it with an interim internal-API-key shared secret (`SUPPLIER_ADMIN_API_KEY`,
  `src/lib/auth/internal-api-key.ts`), checked with a constant-time comparison
  (`node:crypto.timingSafeEqual`) against a `Bearer` token — the smallest real mechanism that
  does not require inventing a new actor system, deploying a new Keycloak client, or reusing an
  actor type this repository cannot reach. Explicitly documented here as interim: a future gate
  that gives Zuribeans a real internal/staff identity (or a baobab-iam workload-credentials
  client, mirroring `baobab-cp`'s `WorkloadVerifier` pattern) supersedes this without needing to
  reverse the column write path itself.
- `SUPPLIER_ADMIN_API_KEY` is validated by its own environment schema
  (`getSupplierAdminEnvironment`, `src/lib/configuration/environment.ts`), deliberately
  independent of `serverSchema`/`publicSchema` — the same reasoning `marketSchema` already
  documents: every other route and page must keep working in an environment that never calls
  this one (including the Foundation image-build gate, which builds with no environment
  variables at all).

## Consequences

- `supplier_organisations.canonical_organisation_id` now has exactly one write path, and it is
  real (Postgres-integration-tested, `src/lib/supplier/repository.test.ts`) rather than stubbed.
- The interim internal-API-key mechanism is scoped to this one route. It is not a general
  internal-auth story for Zuribeans, and no other route should adopt it as a default without its
  own ADR — a real internal/staff identity remains future scope, the same posture ADR-0006 takes
  for ERP mapping and event publishing.
- This does not populate `canonical_organisation_id` for any real supplier by itself: that
  requires a real Keycloak Organization and `baobab-cp` `CanonicalEntity`/`ExternalReference` to
  exist for a given supplier first — live cross-repo infrastructure this ADR does not stand up.
