import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  getMarketEnvironment,
  getPublicEnvironment,
  getSupplierAdminEnvironment,
} from "./environment"

const baseEnv = {
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_test",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
}

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env = { ...originalEnv }
  delete process.env.NEXT_PUBLIC_ENABLED_MARKETS
  delete process.env.NEXT_PUBLIC_DEFAULT_MARKET
  Object.assign(process.env, baseEnv)
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe("getMarketEnvironment", () => {
  it("does not require Medusa credentials to be configured", () => {
    delete process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    delete process.env.NEXT_PUBLIC_SITE_URL
    expect(() => getMarketEnvironment()).not.toThrow()
  })

  it("defaults to both launch markets with South Africa as default", () => {
    const env = getMarketEnvironment()
    expect(env.NEXT_PUBLIC_ENABLED_MARKETS).toEqual(["zuribeans_ug", "zuribeans_za"])
    expect(env.NEXT_PUBLIC_DEFAULT_MARKET).toBe("zuribeans_za")
  })

  it("parses a restricted enabled-markets list", () => {
    process.env.NEXT_PUBLIC_ENABLED_MARKETS = "zuribeans_ug"
    process.env.NEXT_PUBLIC_DEFAULT_MARKET = "zuribeans_ug"
    const env = getMarketEnvironment()
    expect(env.NEXT_PUBLIC_ENABLED_MARKETS).toEqual(["zuribeans_ug"])
  })

  it("rejects an unknown market key", () => {
    process.env.NEXT_PUBLIC_ENABLED_MARKETS = "zuribeans_ug,not-a-market"
    expect(() => getMarketEnvironment()).toThrow()
  })

  it("rejects a default market that is not in the enabled-markets list", () => {
    process.env.NEXT_PUBLIC_ENABLED_MARKETS = "zuribeans_ug"
    process.env.NEXT_PUBLIC_DEFAULT_MARKET = "zuribeans_za"
    expect(() => getMarketEnvironment()).toThrow()
  })
})

describe("getPublicEnvironment", () => {
  it("still requires Medusa credentials in addition to market configuration", () => {
    delete process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    expect(() => getPublicEnvironment()).toThrow()
  })

  it("parses successfully once both Medusa and market configuration are present", () => {
    const env = getPublicEnvironment()
    expect(env.NEXT_PUBLIC_ENABLED_MARKETS).toEqual(["zuribeans_ug", "zuribeans_za"])
    expect(env.NEXT_PUBLIC_DEFAULT_MARKET).toBe("zuribeans_za")
  })
})

describe("getSupplierAdminEnvironment", () => {
  it("does not require Medusa credentials or market configuration", () => {
    delete process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.SUPPLIER_ADMIN_API_KEY = "a".repeat(32)
    expect(() => getSupplierAdminEnvironment()).not.toThrow()
  })

  it("rejects a missing key", () => {
    delete process.env.SUPPLIER_ADMIN_API_KEY
    expect(() => getSupplierAdminEnvironment()).toThrow()
  })

  it("rejects a key shorter than 32 characters", () => {
    process.env.SUPPLIER_ADMIN_API_KEY = "too-short"
    expect(() => getSupplierAdminEnvironment()).toThrow()
  })
})
