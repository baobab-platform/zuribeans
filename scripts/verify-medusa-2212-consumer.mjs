#!/usr/bin/env node
/**
 * Medusa 2.21.2 consumer contract gate. Static mode inventories actual
 * Store API callers; live mode MUST run against a release-attested 2.21.2
 * staging backend with a known market/product and real customer token.
 * Static success is NOT a runtime certification.
 */
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

const root = new URL("../", import.meta.url).pathname
const sources = []
function walk(dir) {
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, file.name)
    if (file.isDirectory()) walk(path)
    else if (/\.(?:tsx?|mjs)$/.test(file.name) && !/\.test\./.test(file.name)) {
      sources.push([relative(root, path), readFileSync(path, "utf8")])
    }
  }
}
walk(join(root, "src"))
const found = []
for (const [path, source] of sources) {
  for (const match of source.matchAll(/\bsdk\.store\.(\w+)\.(\w+)\s*\(/g)) {
    found.push(`${path} :: ${match[1]}.${match[2]}`)
  }
}
const expected = [
  "src/app/register/actions.ts :: customer.create",
  "src/lib/auth/customer.ts :: customer.retrieve",
  "src/lib/medusa/products.ts :: category.list",
  "src/lib/medusa/products.ts :: product.list",
  "src/lib/medusa/products.ts :: product.list",
  "src/lib/medusa/products.ts :: product.list",
]
assert.deepEqual(found.sort(), expected.sort(), "Undeclared SDK Store API consumer: update review matrix")
for (const [path, source] of sources) {
  if (path === "src/lib/buyer/trade-client.ts" || path === "src/lib/catalogue/assortment.ts") {
    // These are Baobab-owned endpoints, NOT Medusa core Store query expansion.
    continue
  }
  assert.doesNotMatch(source, /\/store\/search(?:\b|[/?#])/,
    `Medusa index-expansion route is used in ${path}; add explicit index contract review`)
}
const productSource = sources.find(([p]) => p === "src/lib/medusa/products.ts")?.[1] ?? ""
assert.doesNotMatch(productSource, /\bfields\s*:/, "New fields selections require exact Medusa 2.21.2 allowlist review")
assert.match(productSource, /metadata/, "Product metadata projection requires runtime verification")
assert.match(productSource, /categories\?\./, "Product categories projection requires runtime verification")
assert.match(productSource, /variants\?\./, "Product variants projection requires runtime verification")
console.log("PASS static inventory: six SDK Store calls, no explicit fields selection or /store/search")
console.log("UNVERIFIED: 2.21.2 default product metadata/category/variant projections and authenticated customer at live backend")

if (!process.argv.includes("--live")) process.exit(0)
const required = [
  "MEDUSA_BACKEND_URL", "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
  "MEDUSA_2212_PRODUCT_HANDLE", "MEDUSA_2212_COUNTRY_CODE",
  "MEDUSA_2212_CUSTOMER_TOKEN", "MEDUSA_2212_MARKET_KEY",
  "MEDUSA_2212_RELEASE_ATTESTATION",
]
for (const name of required) {
  assert.ok(process.env[name]?.trim(), `Missing ${name}: cannot certify 2.21.2 consumer`)
}
assert.equal(process.env.MEDUSA_2212_RELEASE_ATTESTATION, "2.21.2",
  "Runner/operator must attest to the actual deployed Trade release")
const base = process.env.MEDUSA_BACKEND_URL.replace(/\/$/, "")
assert.match(base, /^https:\/\//, "Live verification requires HTTPS staging")
const headers = { accept: "application/json", "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
async function get(path, extra = {}) {
  const response = await fetch(base + path, { cache: "no-store", headers: { ...headers, ...extra }, signal: AbortSignal.timeout(12000) })
  assert.equal(response.status, 200, `HTTP ${response.status} ${path}`)
  return response.json()
}
const countryCode = process.env.MEDUSA_2212_COUNTRY_CODE.toLowerCase()
assert.match(countryCode, /^(ug|za)$/, "ZuriBeans runtime gate currently supports UG/ZA only")
const params = new URLSearchParams({ handle: process.env.MEDUSA_2212_PRODUCT_HANDLE, country_code: countryCode, limit: "1" })
const detail = await get("/store/products?" + params.toString())
assert.equal(detail.products?.length, 1, "Expected a seeded, published product in target sales channel")
const product = detail.products[0]
for (const name of ["id", "handle", "title", "description", "metadata", "categories", "variants"]) {
  assert.ok(Object.hasOwn(product, name), `2.21.2 stripped required product field ${name}; review exact allowlist`)
}
assert.ok(product.metadata && typeof product.metadata === "object", "Missing published product metadata fixture")
assert.ok(Array.isArray(product.categories) && product.categories.length > 0, "Product fixture needs categories")
assert.ok(Array.isArray(product.variants) && product.variants.length > 0, "Product fixture needs variants")
for (const cat of product.categories) assert.equal(typeof cat.name, "string")
for (const variant of product.variants) {
  for (const name of ["id", "title", "sku"]) assert.ok(Object.hasOwn(variant, name), `Missing variant.${name}`)
}
const cats = await get("/store/product-categories?limit=100")
assert.ok(Array.isArray(cats.product_categories) && cats.product_categories.length > 0)
for (const item of cats.product_categories) {
  for (const name of ["id", "handle", "name"]) assert.ok(Object.hasOwn(item, name))
}
const list = await get("/store/products?" + new URLSearchParams({ country_code: countryCode, limit: "5", q: product.title }).toString())
assert.ok(Array.isArray(list.products), "q-based product search no longer returns a list")
const assortment = await get("/store/b2b/assortment?" + new URLSearchParams({ market_key: process.env.MEDUSA_2212_MARKET_KEY, require_regulatory_clearance: "true" }).toString())
assert.ok(Array.isArray(assortment.sellable_product_ids), "Missing market-governed assortment")
const customer = await get("/store/customers/me", { authorization: "Bearer " + process.env.MEDUSA_2212_CUSTOMER_TOKEN })
assert.ok(customer.customer?.id, "Authenticated customer retrieval failed")
console.log("PASS live Medusa 2.21.2 ZuriBeans product, variants, metadata, categories, q-search, governed assortment and customer")
