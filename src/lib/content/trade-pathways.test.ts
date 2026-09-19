import { describe, expect, it } from "vitest"
import { TRADE_PATHWAYS } from "@/lib/content/trade-pathways"

describe("trade pathways", () => {
  it("provides one distinct route for each trading audience", () => {
    expect(TRADE_PATHWAYS.map(({ tone }) => tone)).toEqual(["buyer", "supplier"])
    expect(new Set(TRADE_PATHWAYS.map(({ href }) => href)).size).toBe(TRADE_PATHWAYS.length)
  })

  it("keeps supplier submission separate from approval", () => {
    const supplier = TRADE_PATHWAYS.find(({ tone }) => tone === "supplier")

    expect(supplier?.description.toLowerCase()).toContain("does not create automatic approval")
  })
})
