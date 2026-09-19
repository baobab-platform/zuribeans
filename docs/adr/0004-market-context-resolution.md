# ADR 0004: Market context resolution

## Status

Accepted

## Context

Zuribeans must support Uganda and South Africa from the outset, and must not assume a single
global market or hardcode a default country/currency into components. `baobab-platform/baobab-trade`
already bootstraps candidate Baobab Market configuration for both
(`src/baobab/market/market-config.ts`: `zuribeans_ug`/UGX, `zuribeans_za`/ZAR), tagged as
candidates because `baobab-platform/shared`'s legal-entity registry still lists Zuribeans' `markets` as
empty pending Control Plane approval. `baobab-platform/baobab-cp`'s `market.market` table exists but is
unimplemented (no Go type, no API), so there is no canonical `market_id` to resolve against yet.

Zuribeans still needs explicit, testable market behaviour today, without inventing a
competing market identifier or a Zuribeans-only market schema that would need reconciling
later.

## Decision

- Reuse Trade's exact candidate `marketKey`s (`zuribeans_ug`, `zuribeans_za`) as the only valid
  values anywhere in this repository (`src/lib/market/markets.ts`). Adding a market here without
  Trade also bootstrapping it under the same key is not permitted.
- Resolve one active market per request in `src/proxy.ts` (Next.js's proxy/middleware
  convention), in this precedence: an explicit `?market=` query param, then the `zb_market`
  cookie, then `NEXT_PUBLIC_DEFAULT_MARKET`. A request always resolves to exactly one enabled
  market; there is no "no market" state. `NEXT_PUBLIC_ENABLED_MARKETS` lets a deployment launch
  with a subset of markets without a code change.
- Thread the resolved market to Server Components through a request header
  (`x-zuribeans-market`), read back via `src/lib/market/request.ts`. Components never resolve
  market state themselves.
- Pass the market's `countryCode` to Medusa's Store API as pricing context (`country_code`),
  since `@medusajs/types`' `StoreProductPricingContext` documents it as the mechanism for
  market-aware tax and pricing. Do not pass Trade's bootstrap `salesChannel`/`stockLocation`
  keys as `sales_channel_id` filters: those are bootstrap-script labels, not the real Medusa
  IDs Trade generates, and treating them as equivalent would be exactly the kind of invented
  identifier this ADR exists to avoid.
- Also stamp a per-request correlation id (`x-correlation-id`) in the same proxy, generated if
  absent. It is not forwarded to Trade: Trade does not define a storefront-facing header
  contract for it (only for its own Control Plane calls, per
  `src/baobab/contracts/tenant-context.ts`), so inventing one here would assume behaviour Trade
  has not committed to. It exists for this estate's own request tracing (returned by
  `/api/health`) until such a contract exists.

## Consequences

- Multi-market support is config-driven (`NEXT_PUBLIC_ENABLED_MARKETS`,
  `NEXT_PUBLIC_DEFAULT_MARKET`) rather than scattered through components, and is covered by unit
  tests (`src/lib/market/context.test.ts`, `src/lib/configuration/environment.test.ts`).
- Once Control Plane activates real Market records, `zuribeans_ug`/`zuribeans_za` must be
  reconciled against the resulting `market_id`s the same way Trade already plans to (via its own
  `baobab_market_key` tag) — this repository's market keys are not a separate identifier space
  to migrate independently.
- A market switch changes presentation and pricing context only; it does not yet gate catalogue
  eligibility, buyer eligibility, or checkout, since those require Trade contracts this repo does
  not yet consume (see `docs/architecture.md`'s "Remaining upstream gaps").
