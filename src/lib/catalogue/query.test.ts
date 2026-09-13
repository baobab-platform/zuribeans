import { describe, expect, it } from "vitest"
import { catalogueHref, parseCatalogueQuery } from "./query"

describe("catalogue query", () => {
  it("normalizes search, category and pagination input", () => {
    expect(
      parseCatalogueQuery({ q: "  green coffee ", category: "Specialty-Coffee", page: "3" }),
    ).toEqual({
      query: "green coffee",
      category: "specialty-coffee",
      page: 3,
    })
  })

  it("rejects unsafe category handles and invalid pages", () => {
    expect(parseCatalogueQuery({ category: "../private", page: "-4" })).toEqual({ page: 1 })
  })

  it("builds stable catalogue links without an unnecessary first page", () => {
    expect(catalogueHref({ query: "green coffee", category: "coffee", page: 1 })).toBe(
      "/products?q=green+coffee&category=coffee",
    )
  })
})
