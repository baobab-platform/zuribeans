import type { CommodityPresentation } from "@/lib/content/commodity"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import { listProducts } from "@/lib/medusa/products"
import type { ProductCardModel } from "@/lib/medusa/types"
import type { ZuribeansMarket } from "@/lib/market/markets"
import { FeaturedCommodities } from "./featured-commodities"

/**
 * The hero remains streamable. Explicit development synthetic mode uses
 * standalone preview products; production never falls back to fictional lots.
 */
export async function MarketFeaturedCommodities({
  commodities,
  market,
}: {
  commodities: readonly CommodityPresentation[]
  market: ZuribeansMarket
}) {
  let products: readonly ProductCardModel[] = []
  if (isSyntheticExperienceEnabled()) {
    const { getDemoFeaturedProducts } = await import("@/lib/dev-data/catalogue")
    products = getDemoFeaturedProducts().items
  } else {
    try {
      const catalogue = await listProducts({
        countryCode: market.countryCode,
        marketKey: market.marketKey,
        limit: 4,
        offset: 0,
      })
      products = catalogue.items
    } catch {
      // Preserve curated category discovery, not synthetic products.
    }
  }

  return <FeaturedCommodities commodities={commodities} products={products} />
}
