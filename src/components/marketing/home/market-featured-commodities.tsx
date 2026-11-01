import type { CommodityPresentation } from "@/lib/content/commodity"
import { listProducts } from "@/lib/medusa/products"
import type { ZuribeansMarket } from "@/lib/market/markets"
import { FeaturedCommodities } from "./featured-commodities"

/**
 * Streamed below the homepage hero: slow provider lookups never hold up
 * initial hero/assurance delivery or manufacture substitute product records.
 */
export async function MarketFeaturedCommodities({
  commodities,
  market,
}: {
  commodities: readonly CommodityPresentation[]
  market: ZuribeansMarket
}) {
  try {
    const catalogue = await listProducts({
      countryCode: market.countryCode,
      marketKey: market.marketKey,
      limit: 4,
      offset: 0,
    })
    return <FeaturedCommodities commodities={commodities} products={catalogue.items} />
  } catch {
    return <FeaturedCommodities commodities={commodities} />
  }
}
