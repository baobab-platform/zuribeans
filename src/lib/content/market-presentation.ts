import { MARKET_CAPABILITY } from "@/lib/content/corporate-estate"
import { PUBLIC_MARKET_SUMMARIES } from "@/lib/content/public-estate"
import { getMarket, type ZuribeansMarketKey } from "@/lib/market/markets"

export type TradeMapRole = "origin" | "destination"

export type TradeMapLocation = {
  marketKey: ZuribeansMarketKey
  name: string
  countryCode: string
  role: TradeMapRole
  roleLabel: string
  position: { left: number; top: number }
  labelSide: "left" | "right"
}

export type MarketSummaryPresentation = {
  marketKey: ZuribeansMarketKey
  name: string
  currency: string
  role: string
  summary: string
  focus: readonly string[]
}

const MAP_PRESENTATION: Readonly<
  Record<
    ZuribeansMarketKey,
    Pick<TradeMapLocation, "role" | "roleLabel" | "position" | "labelSide">
  >
> = {
  zuribeans_ug: {
    role: "origin",
    roleLabel: "Origin capability",
    position: { left: 58.47, top: 49.55 },
    labelSide: "right",
  },
  zuribeans_za: {
    role: "destination",
    roleLabel: "Buyer market",
    position: { left: 56.93, top: 67.8 },
    labelSide: "left",
  },
}

export const TRADE_MAP_LOCATIONS: readonly TradeMapLocation[] = PUBLIC_MARKET_SUMMARIES.map(
  ({ marketKey }) => {
    const market = getMarket(marketKey)
    return {
      marketKey,
      name: market.displayName,
      countryCode: market.countryCode,
      ...MAP_PRESENTATION[marketKey],
    }
  },
)

export const MARKET_SUMMARY_PRESENTATIONS: readonly MarketSummaryPresentation[] =
  MARKET_CAPABILITY.map((capability) => {
    const market = getMarket(capability.marketKey)
    const publicSummary = PUBLIC_MARKET_SUMMARIES.find(
      (summary) => summary.marketKey === capability.marketKey,
    )

    if (!publicSummary) {
      throw new Error(`Missing public market summary for ${capability.marketKey}`)
    }

    return {
      marketKey: capability.marketKey,
      name: market.displayName,
      currency: market.currency,
      role: capability.operatingRole,
      summary: publicSummary.summary,
      focus: capability.focus,
    }
  })
