import { describe, expect, it } from "vitest"
import { catalogueNavigationCategories, PUBLIC_CATALOGUE_CATEGORIES } from "./navigation-categories"

describe("public catalogue navigation", () => {
  it("always exposes the six supported browsing categories without a live backend", () => {
    const links = catalogueNavigationCategories([])
    expect(links.map((entry) => entry.handle)).toEqual([
      "coffee",
      "vanilla",
      "sesame",
      "rooibos",
      "sorghum",
      "related",
    ])
    expect(links.map((entry) => entry.name)).toEqual(
      PUBLIC_CATALOGUE_CATEGORIES.map((entry) => entry.name),
    )
    expect(links.every((entry) => entry.id.startsWith("navigation-"))).toBe(true)
  })

  it("retains the real provider category identifier and publishes additional categories", () => {
    const links = catalogueNavigationCategories([
      { id: "medusa-coffee", handle: "coffee", name: "Green coffee" },
      { id: "medusa-cacao", handle: "cacao", name: "Cacao" },
    ])
    expect(links.filter((entry) => entry.handle === "coffee")).toEqual([
      { id: "medusa-coffee", handle: "coffee", name: "Green coffee" },
    ])
    expect(links.at(-1)).toEqual({ id: "medusa-cacao", handle: "cacao", name: "Cacao" })
  })
})
