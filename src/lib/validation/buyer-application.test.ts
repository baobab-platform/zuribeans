import { describe, expect, it } from "vitest"
import { buyerApplicationSchema } from "@/lib/validation/buyer-application"

describe("buyer application validation", () => {
  it("accepts an idempotent multi-market application", () => {
    const parsed = buyerApplicationSchema.parse({
      idempotencyKey: "00000000-0000-4000-8000-000000000000",
      legalName: "Acme Procurement",
      countryOfRegistration: "za",
      requestedMarketKeys: ["zuribeans_za", "zuribeans_ug"],
    })

    expect(parsed.countryOfRegistration).toBe("ZA")
    expect(parsed.requestedMarketKeys).toEqual(["zuribeans_za", "zuribeans_ug"])
  })

  it("rejects a missing idempotency identity", () => {
    expect(() =>
      buyerApplicationSchema.parse({
        legalName: "Acme Procurement",
        countryOfRegistration: "ZA",
        requestedMarketKeys: ["zuribeans_za"],
      }),
    ).toThrow()
  })

  it("rejects applications with no requested market", () => {
    expect(() =>
      buyerApplicationSchema.parse({
        idempotencyKey: "00000000-0000-4000-8000-000000000000",
        legalName: "Acme Procurement",
        countryOfRegistration: "ZA",
        requestedMarketKeys: [],
      }),
    ).toThrow()
  })
})
