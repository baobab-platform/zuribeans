import { describe, expect, it } from "vitest"
import {
  applyAssortmentToProductList,
  intersectProductsBySellableIds,
  type AssortmentSnapshot,
} from "./assortment"

describe("catalogue assortment composition", () => {
  const products = [{ id: "prod_a" }, { id: "prod_b" }, { id: "prod_c" }]

  it("passes through when sellable ids are null (no filter)", () => {
    expect(intersectProductsBySellableIds(products, null)).toEqual(products)
  })

  it("intersects published products with Trade sellable ids", () => {
    expect(intersectProductsBySellableIds(products, ["prod_b", "prod_z"])).toEqual([
      { id: "prod_b" },
    ])
  })

  it("strict trade snapshot filters; bypass leaves catalogue unchanged", () => {
    const strict: AssortmentSnapshot = {
      marketKey: "zuribeans_ug",
      sellableProductIds: ["prod_a"],
      mode: "strict",
      source: "trade",
    }
    expect(applyAssortmentToProductList(products, strict)).toEqual([{ id: "prod_a" }])

    const bypass: AssortmentSnapshot = {
      marketKey: "zuribeans_ug",
      sellableProductIds: [],
      mode: "off",
      source: "bypass",
    }
    expect(applyAssortmentToProductList(products, bypass)).toEqual(products)
  })

  it("strict mode with empty sellable set yields no products (fail closed)", () => {
    const empty: AssortmentSnapshot = {
      marketKey: "zuribeans_za",
      sellableProductIds: [],
      mode: "strict",
      source: "trade",
    }
    expect(applyAssortmentToProductList(products, empty)).toEqual([])
  })
})
