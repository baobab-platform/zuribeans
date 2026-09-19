# ZuriBeans frontend UI discovery

Status: Gate 0 complete  
Baseline: `main` at `a52f21fa6a7ed2665c30e282e1714f0374500b3f`  
Reviewed: 2026-09-13

## Executive finding

The repository contains a sound but narrow server-first vertical slice: public marketing,
market-aware catalogue and product detail pages, Medusa customer authentication, a protected
buyer placeholder, and an estate-owned supplier application lifecycle. It is not yet the
production B2B digital estate described by the go-live plan.

The correct next step is incremental hardening. The Medusa adapter, request-scoped market
resolution, httpOnly session storage, and ZuriBeans-owned supplier boundary must be preserved.
Buyer-company, RFQ, quotation, contract-pricing, cart, checkout, order, shipment, invoice, and
payment experiences remain contract-gated; a polished screen must not be mistaken for a working
commercial capability.

## Sources inspected

- All ADRs in `docs/adr/`, including the ZuriBeans Go-Live Implementation Plan.
- `docs/architecture.md`, `docs/development.md`, and `docs/medusa-integration.md`.
- All routes, components, application adapters, validation, database schema, migrations, tests,
  CI workflows, container configuration, environment declarations, contract lock, and runtime
  requirements in this repository.
- Current branches, open pull requests, and recent `main` history.
- The contract gaps recorded in `contracts.lock.yaml` and the cross-repository ownership model
  expressed by the go-live plan.

## Authoritative boundaries

| Concern                                                        | Authority                                                | Frontend responsibility                                                                        |
| -------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Presentation and journeys                                      | ZuriBeans                                                | Compose accessible, market-aware public, buyer, and supplier experiences.                      |
| Products, prices, carts, orders, inventory, fulfilment         | Baobab Trade / Medusa                                    | Consume published Store APIs through `src/lib/medusa`; never reproduce rules locally.          |
| Authentication                                                 | Current Medusa customer flow; future Baobab IAM contract | Keep tokens server-side. Authentication alone never grants trading approval.                   |
| Tenant, legal entity, context, entitlements, engine resolution | Baobab Control Plane                                     | Consume trusted resolved context when published; never resolve canonical authority in leaf UI. |
| Supplier registration and qualification                        | ZuriBeans, per ADR-0006                                  | Own the present lifecycle and estate Postgres until a superseding architecture is accepted.    |
| Accounting and ERP projections                                 | Baobab ERP / iDempiere                                   | No browser-to-ERP integration.                                                                 |
| Content                                                        | Current repository; future Baobab CMS / Payload          | Keep marketing composition CMS-ready without inventing a CMS contract.                         |
| Intelligence                                                   | Baobab Pulse                                             | No direct browser integration until an application contract exists.                            |
| Infrastructure and secrets                                     | `baobab-platform/infrastructure`                         | Declare runtime needs; do not provision infrastructure here.                                   |

## Current route inventory

| Route                         | Audience        | Data/state                              | Current maturity                                                                              |
| ----------------------------- | --------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/`                           | Public          | Static copy plus request market context | Foundation homepage; insufficient trade story and all requests render dynamically.            |
| `/about`                      | Public          | Static copy                             | Minimal placeholder.                                                                          |
| `/contact`                    | Public          | Mail link                               | Safe but not an implemented enquiry workflow.                                                 |
| `/products`                   | Public          | Medusa Store Product API                | Functional grid; no search, filters, pagination controls, or resilient service-error state.   |
| `/products/[handle]`          | Public          | Medusa Store Product API                | Minimal PDP; no media, specification model, metadata, or actionable contract-backed B2B flow. |
| `/login`                      | Customer        | Medusa auth via Server Action           | Functional server-side JWT flow. Copy incorrectly frames every user as a buyer.               |
| `/register`                   | Customer        | Medusa auth/customer APIs               | Functional identity registration; not organisation approval.                                  |
| `/account`                    | Buyer           | Current Medusa customer                 | Protected pending-state placeholder; no authoritative buyer-company contract.                 |
| `/sourcing/become-a-supplier` | Public supplier | Static copy                             | Functional entry page; narrow content.                                                        |
| `/supplier`                   | Supplier        | Session plus estate Postgres            | Functional status and declaration summary.                                                    |
| `/supplier/apply`             | Supplier        | Session plus estate Postgres            | Functional single-page submission; no draft/resume or document storage.                       |
| `/api/health`                 | Operations      | Local health/correlation data           | Present; upstream readiness is not represented as a production dependency check.              |

Missing public routes include Origins & Markets, Trade, Quality & Traceability, and a general
Sourcing page. Missing error/not-found/loading boundaries are repository-wide rather than
intentional per journey.

## Existing strengths to preserve

- App Router and Server Components are the default; the current source contains no `use client`
  directive.
- Medusa construction and product calls are isolated under `src/lib/medusa`.
- Market resolution has explicit precedence and is outside leaf components.
- Market keys mirror Trade bootstrap keys instead of inventing a second namespace.
- The Medusa JWT is stored in an httpOnly, production-secure, SameSite cookie.
- Authentication and trading approval are explicitly separated in both ADR and UI copy.
- Supplier status is an explicit state machine with an audit table, not a boolean.
- Supplier capability fields are category-extensible rather than coffee-specific columns.
- Strict TypeScript, validation, unit tests, Playwright, CI, container build, security workflows,
  and architecture declarations already exist.

## Architecture and version drift

| Item              | Documented/configured state             | Actual/effective state                                        | Required action                                                                  |
| ----------------- | --------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Next.js           | ADR-0001 says 15                        | `next` 16.3.3                                                 | Create a superseding ADR after confirming intent; do not rewrite ADR-0001.       |
| React             | ADR-0001 says 19                        | `react` 19.2.8; `react-dom` 19.1.1                            | Align exact compatible React packages in a dedicated dependency change.          |
| ESLint            | Next.js 16 application                  | `eslint-config-next` 15.5.24 and ESLint 8                     | Reconcile deliberately; do not mix into visual page work.                        |
| Node engine       | `>=22.14.0 <23`                         | Docker and current verification use Node 24                   | Align the engine with the accepted deployable runtime.                           |
| TypeScript config | `jsx: preserve`; no dev type path       | Next.js 16 rewrites to `react-jsx` and adds `.next/dev/types` | Commit the framework-required configuration intentionally.                       |
| Tailwind          | Tailwind 3                              | Tailwind 3.4.17                                               | Preserve for this programme; Tailwind 4 migration is separate.                   |
| Playwright        | Chromium only                           | Requirement is Chromium, Firefox, WebKit                      | Add browser projects and CI support during QA hardening.                         |
| Postgres          | CI service and development notes say 16 | Platform target is PostgreSQL 17                              | Reconcile with estate/runtime standards in a separate database-runtime decision. |

ADR-0005 also conflicts with the later IAM direction: it records stock Medusa customer identity
as the accepted present mechanism, while the platform target assigns authentication to Baobab IAM
and commercial authorization to Trade. ADR-0005 remains the implemented historical decision; an
IAM migration must supersede it only when the required IAM-0 through IAM-4 contracts are actually
available.

## Rendering and cache assessment

`getMarketContext()` reads request headers in the root layout. The production build therefore
reports every application page, including purely stable marketing pages, as dynamically rendered.
This prevents the intended static/revalidated public estate and increases server work.

The market mechanism is nevertheless correct in one important respect: it supplies a
request-scoped market and avoids cross-market cache reuse. The solution must preserve that safety.
Possible future designs include market-scoped URL segments or another explicitly keyed server
cache boundary. Selecting one affects canonical URLs, links, proxy behaviour, analytics, and
Control Plane reconciliation, so it belongs in a superseding market/rendering ADR rather than an
incidental page refactor.

Buyer, supplier, cart, checkout, order, and contract-pricing data must remain dynamic/private and
must never enter a shared Full Route or Data Cache. Public product caching may be added only with
market in the cache key and a valid Trade revalidation policy.

## Current UI assessment

The present visual language is restrained and directionally suitable, but it is a page-level
prototype rather than a design system:

- Five colour variables and two font stacks exist, but spacing, type scale, radius, elevation,
  container, motion, layer, status, focus, and data-visualization tokens do not.
- Buttons, fields, cards, status treatments, and containers repeat utility strings.
- Header navigation disappears on mobile without a replacement menu.
- Market switching is hidden below large-desktop width and uses a query-only link that can discard
  the current pathname's query context.
- The brand and page copy are coffee-heavy despite the accepted multi-product model including
  vanilla and future product classes.
- The public estate lacks the trade, quality, provenance, logistics, and institutional evidence a
  procurement user needs.
- Product cards use an empty image alt even when the image is the primary product content.
- The PDP renders a decorative block instead of available product media and exposes only a tiny
  subset of useful B2B attributes.
- Forms are semantic but lack field descriptions, inline errors, error summaries, pending states,
  and mobile-safe one-column breakpoints.

## Test and CI baseline

Local verification on 2026-09-13 produced:

| Check            | Result              | Observation                                                               |
| ---------------- | ------------------- | ------------------------------------------------------------------------- |
| Install          | Pass with warning   | Node 24 violates the repository's Node 22 engine declaration.             |
| Format           | Fail                | The newly uploaded go-live plan is not Prettier-conformant.               |
| Lint             | Pass                | Current ESLint 8 / Next 15 configuration checks the source.               |
| Type-check       | Pass                | Next.js 16 rewrites two TypeScript settings during build.                 |
| Unit tests       | 50 pass, 3 skip     | Database repository integration tests skip without `SUPPLIER_DB_URL`.     |
| Production build | Pass                | All application routes render dynamically; robots and sitemap are static. |
| E2E              | Not yet run locally | Current suite contains one homepage smoke test and Chromium only.         |

CI runs formatting, lint, type-check, Postgres-backed migrations/tests, build, Chromium E2E, an
image build, architecture validation, CodeQL, dependency audit, shared foundation gates, and
security scans. It does not enforce bundle budgets, Lighthouse thresholds, axe checks, semantic
HTML checks, or three-browser execution.

## Upstream capability blockers

| Capability                                                  | Status                                                                       | Safe frontend action                                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Buyer organisation, members, roles and approval authorities | No published Trade contract                                                  | Information-architecture boundary and explicit pending state only.                           |
| RFQ and quotation                                           | No published contract                                                        | Do not implement domain actions or fake persistence.                                         |
| Contract pricing and product entitlement                    | No published contract                                                        | Never expose or derive private pricing.                                                      |
| Cart/checkout market eligibility                            | Native APIs exist, but authoritative B2B/market rollout is not verified here | Defer purchasing implementation until Trade capability and account entitlement are verified. |
| Orders, shipment, invoice, payment views                    | Required B2B projection contracts not locked                                 | Navigation may remain feature-gated; no fabricated records.                                  |
| Canonical Market IDs                                        | Control Plane model not implemented                                          | Keep current candidate keys and document reconciliation.                                     |
| Baobab IAM customer flow                                    | Platform target exists; migration prerequisites are incomplete               | Preserve current server-only session boundary; do not build a second identity system.        |
| Supplier documents                                          | Object-store contract absent                                                 | Preserve certification metadata only; do not accept uploads that cannot be stored safely.    |
| Supplier review                                             | Staff authorization and workflow surface absent                              | Preserve lifecycle boundary; do not expose status transitions to applicants.                 |
| CMS content                                                 | Payload contract absent                                                      | Use typed, local content composition with a replaceable adapter boundary when needed.        |

## Technical debt and temporary implementations

1. Resolve framework/runtime version drift through explicit, reviewable dependency and ADR work.
2. Decide a market-safe static/rendering model for public pages.
3. Introduce owned design tokens and primitives before expanding pages.
4. Build a responsive global shell and preserve the current server-first architecture.
5. Add route-level loading, error, empty, not-found, unauthorized, and forbidden states.
6. Expand product view models with normalized optional B2B presentation fields; do not pass raw
   Medusa objects into components.
7. Add public information architecture without hardcoding today’s products or markets into shared
   components.
8. Expand automated accessibility, responsive, cross-browser, and performance coverage.
9. Add frontend observability only after the provider and data-handling policy are accepted.
10. Reconcile README claims: login is no longer "visibly unavailable," and the supplier database
    is now a runtime dependency for supplier routes.

## Gate 0 decision

Proceed to reference audit and information architecture. Do not begin buyer-company, RFQ,
quotation, contract-pricing, purchasing, or IAM replacement work until their authoritative
contracts and readiness conditions are demonstrably available. Design-system and public-estate
work can proceed independently, provided it preserves request-scoped market safety and does not
silently choose the future URL/caching model.
