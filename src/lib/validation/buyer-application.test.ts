import { describe, expect, it } from "vitest"
import { buyerApplicationSchema } from "@/lib/validation/buyer-application"

describe("buyer application validation", () => {
  it("accepts an idempotent multi-market application", () => {
    const parsed = buyerApplicationSchema.parse({
      idempotencyKey: "4d5f9a8e-4ed8-4f1b-bf20-b70f693bf12f",
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
        idempotencyKey: "4d5f9a8e-4ed8-4f1b-bf20-b70f693bf12f",
        legalName: "Acme Procurement",
        countryOfRegistration: "ZA",
        requestedMarketKeys: [],
      }),
    ).toThrow()
  })
})
