import { describe, expect, it } from "vitest"
import { isAuthorizedInternalRequest } from "./internal-api-key"

const expectedApiKey = "a".repeat(32)

describe("isAuthorizedInternalRequest", () => {
  it("accepts a matching Bearer token", () => {
    expect(isAuthorizedInternalRequest(`Bearer ${expectedApiKey}`, expectedApiKey)).toBe(true)
  })

  it("rejects a missing Authorization header", () => {
    expect(isAuthorizedInternalRequest(null, expectedApiKey)).toBe(false)
  })

  it("rejects a non-Bearer scheme", () => {
    expect(isAuthorizedInternalRequest(`Basic ${expectedApiKey}`, expectedApiKey)).toBe(false)
  })

  it("rejects a Bearer header with no token", () => {
    expect(isAuthorizedInternalRequest("Bearer", expectedApiKey)).toBe(false)
    expect(isAuthorizedInternalRequest("Bearer ", expectedApiKey)).toBe(false)
  })

  it("rejects a wrong token, even one differing only in length", () => {
    expect(isAuthorizedInternalRequest(`Bearer ${expectedApiKey}x`, expectedApiKey)).toBe(false)
    expect(isAuthorizedInternalRequest(`Bearer ${"b".repeat(32)}`, expectedApiKey)).toBe(false)
  })
})
