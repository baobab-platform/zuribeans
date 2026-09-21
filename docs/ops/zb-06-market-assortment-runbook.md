# Ops runbook — ZB-06 market assortment

**ADRs:** Trade ADR-0011, ADR-0024, ADR-0030 · Estate catalogue composition

## Principle

```text
Medusa published ≠ market sellable
```

Trade owns market assortment rows. The estate **intersects** Medusa catalogue with
`GET /store/b2b/assortment?market_key=` sellable product ids.

## Market keys

| Estate key | Country |
|------------|---------|
| `zuribeans_ug` | UG |
| `zuribeans_za` | ZA |

Use the **same** `market_key` on Trade eligibility rows.

## Operator path

1. Create product/variants in **Medusa admin** (Trade does not invent products).
2. `POST /admin/b2b/product-trade-profiles` — origin, HS reference, trade UOM, etc.
3. `POST /admin/b2b/market-product-eligibility` — `status=ACTIVE` and
   `regulatory_eligibility=ELIGIBLE` (or `ELIGIBLE_WITH_CONDITIONS`) for each market.
4. Optional: `POST .../product-trade-profiles/{id}/canonical-link` after CP linkage.
5. Confirm: `GET /store/b2b/assortment?market_key=zuribeans_ug` includes the product id.
6. Estate: set `ZB06_ASSORTMENT_FILTER=strict` so `/products` filters by that list.

## Estate env

| Variable | Effect |
|----------|--------|
| unset / other | Catalogue shows Medusa publication only (safe until Trade #90 is live) |
| `ZB06_ASSORTMENT_FILTER=strict` | Intersect with Trade assortment; empty/error → no products shown |

Requires `MEDUSA_BACKEND_URL` and publishable key (same as catalogue).

## Fail closed

- `ACTIVE` + `NOT_EVALUATED` → **not** sellable under strict regulatory clearance.
- Assortment HTTP error in strict mode → empty sellable set.

## Out of scope

Object storage for product docs, regulatory providers, ERP item, lot eligibility,
customer-specific catalogues.
