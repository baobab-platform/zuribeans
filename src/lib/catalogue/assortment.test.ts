import { describe, expect, it } from "vitest"
import {
  applyAssortmentToProductList,
  intersectProductsBySellableIds,
  pageSellableProductIds,
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

  it("pages sellable ids for coherent catalogue pagination", () => {
    const ids = ["p1", "p2", "p3", "p4", "p5"]
    expect(pageSellableProductIds(ids, { limit: 2, offset: 0 })).toEqual({
      pageIds: ["p1", "p2"],
      total: 5,
      limit: 2,
      offset: 0,
    })
    expect(pageSellableProductIds(ids, { limit: 2, offset: 4 }).pageIds).toEqual(["p5"])
    expect(pageSellableProductIds(ids, { limit: 2, offset: 10 }).pageIds).toEqual([])
  })
})
