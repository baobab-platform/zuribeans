# Medusa 2.21.2 compatibility — ZuriBeans consumer evidence

**Reviewed:** 10 October 2026, `baobab-platform/zuribeans` `main`. **Target:** `baobab-platform/baobab-trade` Medusa 2.20.1 → 2.21.2 canary #126. **Result:** STATICALLY LOW RISK, **NOT YET RUNTIME CERTIFIED**.

## Actual Store API consumer census

| Repo source | Store operation | Query/selector | Response projection ZuriBeans relies on | Upgrade risk |
| --- | --- | --- | --- | --- |
| `src/lib/medusa/products.ts` | `sdk.store.category.list` | `limit:100` | `id,handle,name` | Core category defaults need staging confirmation |
| `src/lib/medusa/products.ts` | `sdk.store.product.list` (regular catalogue) | `limit,offset,country_code,q?,category_id?` | `id,handle,title,subtitle,thumbnail,metadata.origin` | Metadata is public-facing, so absence breaks origin labeling |
| `src/lib/medusa/products.ts` | `sdk.store.product.list` (strict market assortment) | `id:[...],limit,country_code,q?,category_id?` | Same card fields, canonical ordering from Trade assortment | `id` filtering and `q` must survive; market qualification cannot be replaced by Medusa publication |
| `src/lib/medusa/products.ts` | `sdk.store.product.list` (detail via handle) | `handle,limit:1,country_code?` | Above + `description,metadata, categories[].name,variants[].id,title,sku` | **Highest-risk default projection** |
| `src/lib/auth/customer.ts` | `sdk.store.customer.retrieve` | No explicit `fields`, server-side JWT | `StoreCustomer` (identity/session) | Confirm authenticated response + no private unrelated entities |
| `src/app/register/actions.ts` | `sdk.store.customer.create` | Customer payload, `{}` query, auth bearer header | Successful registration/login | Mutating contract unchanged conceptually, still needs end-to-end proof |

**Other consumption:** `src/lib/buyer/trade-client.ts` uses Baobab-owned `/store/b2b/...` buyer routes; `src/lib/catalogue/assortment.ts` uses `/store/b2b/assortment` in strict mode. These are not Medusa's core Store `fields` allowlist, but must remain tenant/market-policy correct. ZuriBeans' own `src/app/products` routes and insights (Payload CMS authority) are not Medusa `/store/search` callers.

**Static conclusion:** No consumer currently passes a Medusa `fields` selector or calls `/store/search`. The Medusa 2.21.0 **exact-path allowlist** therefore does not directly remove any *explicitly requested* relation; 2.21.2's search-index-only expansion cannot directly break a `/store/search` request that the estate does not make. However, absence of `fields` does **not** prove that the **default** product metadata, variants and categories returned by Medusa 2.21.2 match the estate's presentation assumptions. This is the principal acceptance gap.

ZuriBeans presently pins `@medusajs/js-sdk` and `@medusajs/types` at 2.21.0. That does NOT attest to the deployed Medusa server being 2.21.2; the server's actual generated response and its allowed fields must be verified separately.

## Executable gates

```sh
node scripts/verify-medusa-2212-consumer.mjs        # static; fails on added/unreviewed store calls
# Run only against staging Trade actually deployed from Medusa 2.21.2.
# Inject these from protected CI environment/secrets; never commit values:
MEDUSA_BACKEND_URL=https://<reviewed-staging-host> \
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<staging-sales-channel-publishable-key> \
MEDUSA_2212_PRODUCT_HANDLE=<seeded-published-product-with-metadata-categories-variants> \
MEDUSA_2212_COUNTRY_CODE=za \
MEDUSA_2212_CUSTOMER_TOKEN=<real-staging-test-customer-token> \
MEDUSA_2212_MARKET_KEY=zuribeans_za \
MEDUSA_2212_RELEASE_ATTESTATION=2.21.2 \
node scripts/verify-medusa-2212-consumer.mjs --live
```

The live gate requires a real published product fixture and a governed market, rejects missing test inputs and missing response fields, verifies `q`-based search and checks authenticated customer retrieval. Re-run for `UG` and `ZA` where both market configurations are staged and accepted. It cannot replace buyer order/checkout E2E, routing, local statutory/regulatory decisions or LA-05 legal-seller authorization.

## Do not over-correct the Store allowlist

**Do not apply broad `allowFields("*")`, `allowFields("variants")` as a surrogate for nested paths, or a relation-depth increase.** If the live canary strips an actually required field, first inspect Medusa 2.21.2's installed route defaults and `allowed` entries. Add a narrow, explicit consumer `fields` selector only if its exact path is *already* safe and core-allowed. Otherwise propose a separately reviewed, route-scoped server `allowFields` addition with no `method/methods` key, test both positive and private-pivot cases, and retain market and sales-channel isolation.

## Decision

**ZuriBeans pre-upgrade assessment: CONDITIONAL.** A source-level request inventory is complete; real Store response equivalence, market-specific assortment, authenticated customer and eventual buyer checkout checks are *not yet demonstrated*. Keep Trade #126 a draft until runtime evidence is attached.
