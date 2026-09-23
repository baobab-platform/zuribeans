# Ops runbook — ZB-06 market assortment

**ADRs:** Trade ADR-0011, ADR-0024, ADR-0030 · Estate catalogue composition  
**Trade status:** baobab-trade#90 merged to `main` (2026-09-22)

## Principle

```text
Medusa published ≠ market sellable
```

Trade owns market assortment rows. The estate **intersects** Medusa catalogue with
`GET /store/b2b/assortment?market_key=` sellable product ids.

## Enable strict filter (estate)

1. Confirm Trade deploy includes `GET /store/b2b/assortment`.
2. Set runtime env on the estate host/platform:

```bash
ZB06_ASSORTMENT_FILTER=strict
```

3. Restart the estate process so `process.env` is re-read.
4. Run the smoke path below before announcing catalogue readiness.

| Variable | Effect |
|----------|--------|
| unset / other | Catalogue shows Medusa publication only |
| `ZB06_ASSORTMENT_FILTER=strict` | Intersect with Trade assortment; empty/error → no products |

Requires `MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Market keys

| Estate key | Country |
|------------|---------|
| `zuribeans_ug` | UG |
| `zuribeans_za` | ZA |

Use the **same** `market_key` on Trade eligibility rows.

## Operator path (data)

1. Create product/variants in **Medusa admin** (Trade does not invent products).
2. `POST /admin/b2b/product-trade-profiles` — origin, HS reference, trade UOM, etc.
3. `POST /admin/b2b/market-product-eligibility` — `status=ACTIVE` and
   `regulatory_eligibility=ELIGIBLE` (or `ELIGIBLE_WITH_CONDITIONS`) for each market.
4. Optional: `POST .../product-trade-profiles/{id}/canonical-link` after CP linkage.
5. Confirm assortment (step A of smoke).
6. Estate with `ZB06_ASSORTMENT_FILTER=strict` filters `/products` and PDPs.

## Smoke path

### A — Trade assortment API

```bash
curl -sS -H "x-publishable-api-key: $NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" \
  "$MEDUSA_BACKEND_URL/store/b2b/assortment?market_key=zuribeans_za&require_regulatory_clearance=true" | jq .
```

Expect JSON with `sellable_product_ids`, `blocked`, and `counts`.

### B — Sellable product appears in catalogue

1. Ensure at least one product id is in `sellable_product_ids` for `zuribeans_za`.
2. Open estate `/products` with default market ZA (or switch market to ZA).
3. That product’s card is visible; a Medusa-published product **not** in the list is absent.

### C — Fail closed

1. Product with market row `ACTIVE` + `NOT_EVALUATED` must **not** appear under strict.
2. Product with `SUSPENDED` + `ELIGIBLE` must **not** appear.
3. PDP for a blocked product → not found / empty when strict is on.

### D — Local pure tests (no backend)

```bash
pnpm test -- src/lib/catalogue/assortment.test.ts
```

## Fail closed

- `ACTIVE` + `NOT_EVALUATED` → **not** sellable under strict regulatory clearance.
- Assortment HTTP error in strict mode → empty sellable set.

## Out of scope

Object storage for product docs, regulatory providers, ERP item, lot eligibility,
customer-specific catalogues.
