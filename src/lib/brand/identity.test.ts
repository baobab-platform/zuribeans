import { describe, expect, it } from "vitest"
import { ZURIBEANS_IDENTITY } from "./identity"

describe("ZuriBeans trade-house identity", () => {
  it("distinguishes the estate from its holding group", () => {
    expect(ZURIBEANS_IDENTITY.name).toBe("ZuriBeans")
    expect(ZURIBEANS_IDENTITY.group).toBe("Nabhold Group Africa")
    expect(ZURIBEANS_IDENTITY.category).toContain("commodity trading")
    expect(ZURIBEANS_IDENTITY.typography).toEqual({
      editorial: "Source Serif 4",
      interface: "Source Sans 3",
    })
  })

  it("keeps buyer procurement and supplier sourcing separate", () => {
    expect(ZURIBEANS_IDENTITY.journeys.buyer.entry).toBe("/buyer")
    expect(ZURIBEANS_IDENTITY.journeys.supplier.entry).toBe("/sourcing/become-a-supplier")
    expect(ZURIBEANS_IDENTITY.journeys.buyer.label).not.toBe(
      ZURIBEANS_IDENTITY.journeys.supplier.label,
    )
  })

  it("does not present ZuriBeans as a carrier, retailer or holding company", () => {
    const message = [
      ZURIBEANS_IDENTITY.category,
      ZURIBEANS_IDENTITY.descriptor,
      ...Object.values(ZURIBEANS_IDENTITY.journeys).map((journey) => journey.description),
    ].join(" ")
    expect(message).not.toMatch(/parcel booking|shipping provider|coffee shop|investment holding/i)
  })
})
