import { FeaturedCommodities } from "@/components/marketing/home/featured-commodities"
import { HomeHero } from "@/components/marketing/home/home-hero"
import { QualityEvidence } from "@/components/marketing/home/quality-evidence"
import { TradeProcess } from "@/components/marketing/home/trade-process"
import { TradePathways } from "@/components/marketing/home/trade-pathways"
import { TrustEvidenceStrip } from "@/components/marketing/home/trust-evidence-strip"
import { MarketFootprint } from "@/components/markets/market-footprint"
import { getVisibleEvidence } from "@/lib/content/evidence"
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

  return (
    <>
      <HomeHero content={HOME_HERO} market={market} />
      <TrustEvidenceStrip items={visibleEvidence} />
      <FeaturedCommodities commodities={PUBLIC_PRODUCT_CLASSES} />
      <MarketFootprint />
      <TradeProcess steps={TRADE_STEPS} />

      <QualityEvidence items={QUALITY_EVIDENCE_ITEMS} />
      <TradePathways pathways={TRADE_PATHWAYS} />
    </>
  )
}
