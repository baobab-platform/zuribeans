import { describe, expect, it } from "vitest"
import { isSyntheticExperienceEnabled } from "./enablement"
import {
  DEMO_PRODUCTS,
  DEMO_PRODUCT_CATEGORIES,
  getDemoFeaturedProducts,
  listDemoProducts,
} from "./catalogue"

describe("synthetic Figma procurement showcase", () => {
  it("cannot enable synthetic publication in production", () => {
    expect(
      isSyntheticExperienceEnabled({
        NODE_ENV: "production",
        ZB_DEV_DATA_MODE: "synthetic",
      } as NodeJS.ProcessEnv),
    ).toBe(false)
  })

  it("shows a varied four-card catalogue with explicit synthetic provenance", () => {
    const featured = getDemoFeaturedProducts()
    expect(featured.items).toHaveLength(4)
    expect(featured.items.map((product) => product.cardFacts?.displayName)).toEqual([
      "Robusta Coffee",
      "Arabica Coffee",
      "Vanilla Planifolia",
      "Sesame Seeds",
    ])
    for (const product of featured.items) {
      expect(product.id).toMatch(/^fixture-/)
      expect(product.cardFacts?.source).toBe("synthetic")
      expect(product.cardFacts?.grade).toBeTruthy()
      expect(product.cardFacts?.process).toBeTruthy()
      expect(product.cardFacts?.certification).toBeTruthy()
      expect(product.cardFacts?.supplyStatus).toMatch(/Available|Limited/)
      expect(product.cardFacts?.minimumOrder).toBeTruthy()
      expect(product.cardFacts?.incoterms).toMatch(/FOB/)
      expect(product.handle).toMatch(/^demo-/)
    }
  })

  it("makes six prototype classes searchable/filterable without creating commercial authority", () => {
    const category = DEMO_PRODUCT_CATEGORIES.find((entry) => entry.handle === "sesame")
    expect(category).toBeDefined()
    const matches = listDemoProducts({ categoryId: category?.id, query: "sesame" })
    expect(matches.items.length).toBeGreaterThan(0)
    expect(matches.items.every((item) => item.cardFacts?.source === "synthetic")).toBe(true)
    expect(DEMO_PRODUCTS.every((item) => item.quotation === null)).toBe(true)
    expect(DEMO_PRODUCTS.every((item) => item.inventoryAuthority === null)).toBe(true)
    expect(DEMO_PRODUCTS.every((item) => item.supplierPrincipal === null)).toBe(true)
  })
})
