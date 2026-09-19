# Architecture

Zuribeans is a customer-facing B2B digital estate. It owns presentation, branding,
navigation, content composition and buying journeys. Baobab Trade owns commerce.

## Runtime flow

Customer requests reach Next.js. Server Components call application-level functions in
`src/lib/medusa`; that adapter calls Medusa's Store API with the storefront publishable
key. Components never call Medusa directly. ERP and Pulse are not browser dependencies.

## Data behaviour

| Data                    | Rendering and cache rule                                                          |
| ----------------------- | --------------------------------------------------------------------------------- |
| Marketing content       | Static/server rendered                                                            |
| Public catalogue        | Server rendered; revalidation may be added after catalogue volatility is measured |
| Availability            | Dynamic or short-lived                                                            |
| Buyer pricing           | Authenticated, private and never placed in a shared cache                         |
| Cart, account, checkout | Dynamic and private                                                               |

## B2B capability ownership

Medusa-native products, customers, customer groups, sales channels, price lists, carts and
orders must be used first. Company hierarchies, quotation workflows, saved lists, purchasing
approval and credit terms require Trade contracts before frontend implementation. ERP
documents normally flow through Trade rather than direct browser-to-ERP calls.

## Market context

Zuribeans supports Uganda and South Africa from the outset (see
`docs/adr/0004-market-context-resolution.md`). `src/proxy.ts` resolves one active market per
request — an explicit `?market=` query param, then the visitor's `zb_market` cookie, then the
deployment's configured default (`NEXT_PUBLIC_DEFAULT_MARKET`) — and exposes it to Server
Components via `src/lib/market/request.ts`. The resolved market's `countryCode` is passed to
Medusa's Store API as pricing context (`country_code`); nothing about a market is ever
hardcoded into a component. `src/lib/market/markets.ts` mirrors the exact candidate
`marketKey`s Trade already bootstraps (`zuribeans_ug`, `zuribeans_za`) rather than inventing a
parallel identifier; see the gap this still leaves open below.

## Buyer identity

Authentication uses Medusa's native customer identity (see
`docs/adr/0005-buyer-session-storage.md`) — there is no separate Zuribeans identity store.
`src/app/register` creates a Medusa customer (email, password, name, `company_name`) via
`sdk.auth.register` + `sdk.store.customer.create` + `sdk.auth.login`, following Medusa's
documented registration sequence exactly. `src/app/login` authenticates with `sdk.auth.login`.
Both persist the resulting JWT through `src/lib/auth/session-storage.ts`, a `CustomStorage`
adapter backed by an httpOnly, secure, `SameSite=lax` cookie — the token never reaches
client-side JavaScript. `src/app/account` is a protected layout: `getCurrentCustomer()`
(`src/lib/auth/customer.ts`) resolves the signed-in customer from that cookie, or `null` on any
failure (no session, expired token, Trade unreachable), and the layout redirects to `/login`
when it is `null`.

Signing in is deliberately not the same as being an approved trading account: the `/account`
dashboard states plainly that catalogue pricing, quotations, orders, shipments and invoices
unlock only once a buyer organisation is reviewed and approved — a workflow this repository
does not yet implement, because it needs the company/approval-flow contracts Trade has not
published (see the gaps below). Do not wire pricing, quoting or ordering to a merely
authenticated customer.

## Supplier registration

Zuribeans is two-sided: it also owns supplier registration and qualification (see
`docs/adr/0006-supplier-registration-data-ownership.md`). `/sourcing/become-a-supplier` is the
public entry point; `/supplier/apply` collects organisation details, a primary contact, one or
more structured product-capability declarations (`src/lib/supplier/categories.ts` — an
extensible category registry, never per-product columns) and optional certifications; `/supplier`
shows the applicant their current lifecycle state and declared (not yet verified) capabilities.

Unlike buyers, there is no other system anywhere in this ecosystem that models suppliers at all
— Medusa has no vendor concept, Control Plane has no canonical Organisation, and ERP integration
does not exist — so this is the first Zuribeans-owned persistent state (a Postgres database via
Drizzle, `SUPPLIER_DB_URL`, read only in `src/lib/db/client.ts`; never shared with or a copy of
any Baobab engine's database). The full lifecycle from the brief
(`src/lib/supplier/lifecycle.ts`: `draft → submitted → under_review → … → active`) is modelled
and tested even though this increment only ever exercises `draft → submitted` — there is no
staff review surface yet, and every status change is recorded in `supplier_status_events` for
when one exists.

Suppliers authenticate with the same Medusa customer identity as buyers (`getCurrentCustomer()`)
rather than a parallel identity system — `supplier_organisations.medusa_customer_id` is the
join. `/login` and `/register` accept a `next` parameter (validated by
`src/lib/auth/safe-redirect.ts` against open-redirect payloads) so a supplier arriving from the
public site returns to `/supplier/apply` after signing in rather than landing on the buyer
dashboard; `src/lib/auth/require-customer.ts` reads the actual requested path from a header
`src/proxy.ts` sets, so a protected layout's redirect never loses a nested route (e.g.
`/supplier/apply`, not just `/supplier`).

## Remaining upstream gaps (see `contracts.lock.yaml`)

- Trade has not published company accounts, quotation, saved-list or approval-flow contracts,
  so buyer organisations, RFQs and contract pricing remain out of scope here until they exist.
- Control Plane has not registered or activated real Market records, so the market keys above
  are candidates pinned to Trade's own bootstrap config, not resolved `market_id`s. Reconcile
  them once Control Plane's `market.market` table is implemented.
- Control Plane's Digital Estate representation is a stub (tenant/name/domain/status only);
  richer estate registration (business model, markets, capability bindings) needs an ADR in
  `baobab-platform/baobab-cp` before this repository can consume it.
- No ERP Business Partner mapping, no event publishing (no broker exists in this ecosystem yet),
  no document/object storage for certifications, and no staff qualification review UI — see
  ADR 0006 for why each is deferred rather than faked.

The organisational classification mismatch this document used to record (Shared ADR-0001
describing Zuribeans as B2C/Astro) has been resolved upstream: Shared now classifies Zuribeans
as B2B/Next.js in both ADR-0001 and `contracts/legal-entity/registry.yaml`.
