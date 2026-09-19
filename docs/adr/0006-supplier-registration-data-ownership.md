# ADR 0006: Supplier registration data ownership

## Status

Accepted

## Context

The supplier-side amendment requires Zuribeans to support supplier registration, structured
capability declarations, certifications, and an explicit qualification lifecycle — and to prove
a real registration-to-qualification vertical slice, not a scaffold.

Re-running this repository's "who owns this, who is authoritative" discovery (the same process
used for market context and buyer auth) turns up nothing to defer to:

- `baobab-platform/baobab-trade` runs stock Medusa, which has no supplier/vendor concept at all — Medusa
  models customers and B2B buyer organisations, never the procurement side.
- `baobab-platform/baobab-cp`'s canonical model has no Organisation type (confirmed earlier this
  program: only `Tenant`/`LegalEntity`, governance-tier, not a domain entity a supplier
  application could reference) and its `Mapping`/`MappingScope` tables don't yet match their own
  accepted schema (see `baobab-platform/baobab-cp`'s own reconciliation audit).
- ERP integration (`baobab-platform/baobab-erp`, iDempiere) does not exist yet in this ecosystem — no
  adapter, no Business Partner sync, nothing to create prematurely.

There is, in short, no other authoritative system for "is this organisation an approved
Zuribeans supplier and what can it supply" — so Zuribeans must be that system for now. This is
also the first feature that needs the estate to hold real state beyond session cookies.

## Decision

- Add a Postgres database owned entirely by this estate (`SUPPLIER_DB_URL`, read only in
  `src/lib/db/client.ts`) — not shared with, and never a copy of, any Baobab engine's database.
  Drizzle ORM + `drizzle-kit` migrations (`drizzle/`), chosen for being TypeScript-native and
  explicit about the exact SQL it runs, over a heavier code-generation ORM.
- Reuse the Medusa customer identity already built for buyers (`getCurrentCustomer()`) as the
  supplier's login too — `supplier_organisations.medusa_customer_id` is the join, not a new
  identity system. One application per customer in this increment (a unique constraint); richer
  multi-user organisation membership is future scope the `supplier_contacts` table anticipates
  without yet enforcing.
- Model the full lifecycle from the brief (`src/lib/supplier/lifecycle.ts`) as an enum and an
  explicit transition table, not a boolean — even though this increment's application code only
  ever exercises `draft → submitted`. A future staff qualification surface calls the same
  `assertSupplierStatusTransition`, and `supplier_status_events` already gives it an audit trail
  to write to.
- Capability and certification data uses generic columns (`product_category`, `variety`,
  `grade`, …) keyed by an extensible category registry (`src/lib/supplier/categories.ts`), never
  `coffee_*`/`vanilla_*` columns — adding a category is a one-line registry change, not a
  migration.
- `supplier_organisations.canonical_organisation_id` is reserved, nullable, and never populated
  by this increment's code. It exists so that once Control Plane implements a real canonical
  Organisation/Mapping model, reconciliation has a column to write into rather than requiring a
  destructive schema change.

## Explicitly deferred (tracked as gaps, not silently skipped)

- **ERP Business Partner mapping.** No adapter exists anywhere in this ecosystem yet; creating
  one here would be inventing the very coupling this platform's canonical-mapping architecture
  exists to prevent. `canonical_organisation_id` above is the seam for when it does.
- **Event publishing.** `supplier.application.submitted` and friends are real names from the
  brief's event catalogue, but no message broker exists in this ecosystem to publish them to
  (confirmed via `baobab-platform/shared`'s own reconciliation audit: "no RabbitMQ publisher exists yet
  … no broker available to verify one against"). `supplier_status_events` is the durable record
  a future outbox/publisher can replay from — building a broker integration with nothing on the
  other end would be exactly the "heavyweight infrastructure … not justified by current
  workload" this platform's engineering constraints warn against.
- **File/object storage for certification documents.** This increment captures certification
  _metadata_ (type, issuer, reference, dates) only. Actual document upload needs an object
  storage decision this ADR does not make.
- **Staff qualification review UI.** The lifecycle and audit trail exist; no surface yet lets
  staff move an application through them. Out of scope for the registration vertical slice.
- **Supplier matching / sourcing requirements.** Downstream of qualification; not started.

## Consequences

- This is the first Zuribeans-owned persistent state in the repository. `runtime/requirements.yaml`
  now documents it explicitly as the one exception to "no database access," scoped to data this
  repository alone is authoritative for.
- CI now runs a real Postgres service container and applies migrations before the unit-test
  step (see `.github/workflows/ci.yml`) — schema mistakes fail CI directly rather than only
  surfacing against a developer's local database.
- Supplier pages must never be pulled into static generation (they already aren't: reading the
  session cookie via `getCurrentCustomer()` forces dynamic rendering, the same mechanism
  covering `/account`) — the Foundation image-build gate builds this Dockerfile with no
  environment variables at all, so anything requiring `SUPPLIER_DB_URL` at build time would
  repeat the exact class of failure this program already hit once with Medusa credentials (see
  ADR context in the market-resolution fix commit).
