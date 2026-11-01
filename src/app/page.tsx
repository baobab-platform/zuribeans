import { FeaturedCommodities } from "@/components/marketing/home/featured-commodities"
import { HomeInsights } from "@/components/marketing/home/home-insights"
import { HomeHero } from "@/components/marketing/home/home-hero"
import { QualityEvidence } from "@/components/marketing/home/quality-evidence"
import { TradeProcess } from "@/components/marketing/home/trade-process"
import { TradePathways } from "@/components/marketing/home/trade-pathways"
import { TrustEvidenceStrip } from "@/components/marketing/home/trust-evidence-strip"
import { MarketFootprint } from "@/components/markets/market-footprint"
import { getVisibleEvidence } from "@/lib/content/evidence"
import { listProducts } from "@/lib/medusa/products"
import type { ProductCardModel } from "@/lib/medusa/types"
import { HOME_HERO, TRUST_EVIDENCE } from "@/lib/content/homepage"
import { PUBLIC_PRODUCT_CLASSES, TRADE_STEPS } from "@/lib/content/public-estate"
import { QUALITY_EVIDENCE_ITEMS } from "@/lib/content/quality"
import { TRADE_PATHWAYS } from "@/lib/content/trade-pathways"
import { getMarketContext } from "@/lib/market/request"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "African products, traded with rigour",
  description:
    "ZuriBeans connects professional buyers and qualified suppliers through disciplined sourcing, quality information and cross-border trade capability.",
  path: "/",
})

export default async function HomePage() {
  const { active: market } = await getMarketContext()
  const visibleEvidence = getVisibleEvidence(TRUST_EVIDENCE)
  let featuredProducts: ProductCardModel[] = []
  try {
    // Only public, market-scoped published products; never synthetic fallback on failure.
    const catalogue = await listProducts({
      countryCode: market.countryCode,
      marketKey: market.marketKey,
      limit: 4,
      offset: 0,
    })
    featuredProducts = catalogue.items
  } catch {
    // The independently curated product-class cards remain visible on provider failure.
  }

  return (
    <>
      <HomeHero content={HOME_HERO} market={market} />
      <TrustEvidenceStrip items={visibleEvidence} />
      <FeaturedCommodities commodities={PUBLIC_PRODUCT_CLASSES} products={featuredProducts} />
      <MarketFootprint />
      <TradeProcess steps={TRADE_STEPS} />

      <QualityEvidence items={QUALITY_EVIDENCE_ITEMS} />
      <HomeInsights marketKey={market.marketKey} />
      <TradePathways pathways={TRADE_PATHWAYS} />
    </>
  )
}
