import { describe, expect, it } from "vitest"
import { exactNativeSession } from "./native-qualification-session"

const safe = {
  authenticated: true,
  principal_id: "11111111-1111-4111-8111-111111111111",
  csrf: "z".repeat(43),
}

describe("IAM N02 first-party native session envelope", () => {
  it("accepts only the strict CP Principal readback display envelope", () => {
    expect(exactNativeSession(safe)).toBe(true)
  })
  it.each([
    null,
    [],
    false,
    { ...safe, authenticated: false },
    { ...safe, authenticated: "true" },
    { ...safe, principal_id: "not-a-uuid" },
    { ...safe, csrf: "" },
    { ...safe, access_token: "must-not-reach-browser" },
    { ...safe, tenant_id: "never-a-claim" },
    { ...safe, market: "ZA" },
    { ...safe, scope: "trade:buy" },
    { ...safe, buyer_authorized: true },
    { authenticated: true, principal_id: safe.principal_id },
  ])("rejects malformed or authority-bearing native sessions %#", (value) => {
    expect(exactNativeSession(value)).toBe(false)
  })
})
