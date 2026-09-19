import { describe, expect, it } from "vitest"
import {
  MARKET_SUMMARY_PRESENTATIONS,
  TRADE_MAP_LOCATIONS,
} from "@/lib/content/market-presentation"
import { ZURIBEANS_MARKETS } from "@/lib/market/markets"

describe("market presentation model", () => {
  it("normalizes every configured market for both map and summary views", () => {
    const configuredKeys = ZURIBEANS_MARKETS.map(({ marketKey }) => marketKey)

    expect(TRADE_MAP_LOCATIONS.map(({ marketKey }) => marketKey)).toEqual(configuredKeys)
    expect(MARKET_SUMMARY_PRESENTATIONS.map(({ marketKey }) => marketKey)).toEqual(configuredKeys)
  })

  it("keeps map markers inside the owned projection", () => {
    for (const location of TRADE_MAP_LOCATIONS) {
      expect(location.position.left).toBeGreaterThanOrEqual(0)
      expect(location.position.left).toBeLessThanOrEqual(100)
      expect(location.position.top).toBeGreaterThanOrEqual(0)
      expect(location.position.top).toBeLessThanOrEqual(100)
    }
  })
})
