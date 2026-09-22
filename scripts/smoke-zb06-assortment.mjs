#!/usr/bin/env node
/**
 * Live smoke for Gate ZB-06 store assortment (ADR-0030).
 * Requires MEDUSA_BACKEND_URL + NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.
 *
 * Usage:
 *   node scripts/smoke-zb06-assortment.mjs [market_key]
 * Default market_key: zuribeans_za
 */

const base = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "")
const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const marketKey = process.argv[2] || "zuribeans_za"

if (!base || !key) {
  console.error(
    "Missing MEDUSA_BACKEND_URL or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY — cannot live-smoke.",
  )
  process.exit(2)
}

const url = new URL(`${base}/store/b2b/assortment`)
url.searchParams.set("market_key", marketKey)
url.searchParams.set("require_regulatory_clearance", "true")

const res = await fetch(url, {
  headers: {
    accept: "application/json",
    "x-publishable-api-key": key,
  },
})

const text = await res.text()
let body
try {
  body = JSON.parse(text)
} catch {
  body = text
}

console.log(JSON.stringify({ status: res.status, market_key: marketKey, body }, null, 2))

if (!res.ok) {
  console.error("Assortment endpoint failed — deploy Trade #90 route before enabling strict filter.")
  process.exit(1)
}

if (!body || !Array.isArray(body.sellable_product_ids)) {
  console.error("Response missing sellable_product_ids array.")
  process.exit(1)
}

console.log(
  `OK: evaluated=${body.counts?.evaluated ?? "?"} sellable=${body.sellable_product_ids.length} blocked=${body.blocked?.length ?? "?"}`,
)
