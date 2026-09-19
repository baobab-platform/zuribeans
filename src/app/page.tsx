import { FeaturedCommodities } from "@/components/marketing/home/featured-commodities"
import { HomeHero } from "@/components/marketing/home/home-hero"
import { QualityEvidence } from "@/components/marketing/home/quality-evidence"
import { TradeProcess } from "@/components/marketing/home/trade-process"
import { TrustEvidenceStrip } from "@/components/marketing/home/trust-evidence-strip"
import { MarketFootprint } from "@/components/markets/market-footprint"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getVisibleEvidence } from "@/lib/content/evidence"
import { HOME_HERO, TRUST_EVIDENCE } from "@/lib/content/homepage"
import { PUBLIC_PRODUCT_CLASSES, TRADE_STEPS } from "@/lib/content/public-estate"
import { QUALITY_EVIDENCE_ITEMS } from "@/lib/content/quality"
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

      <section className="page-container grid gap-6 py-20 md:grid-cols-2 lg:py-28">
        <Card className="bg-ink p-8 text-white md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay-inverse">
            For professional buyers
          </p>
          <h2 className="mt-5 font-display text-3xl md:text-4xl">Bring us a real requirement.</h2>
          <p className="mt-4 max-w-lg leading-7 text-white/75">
            Tell the trade desk what you need to source, where it must arrive and when. We will not
            manufacture an instant price where the commercial context is incomplete.
          </p>
          <ButtonLink href="/contact" className="mt-8 bg-clay text-ink hover:bg-clay-inverse">
            Request a Quote
          </ButtonLink>
        </Card>
        <Card className="bg-surface-raised p-8 md:p-10">
          <p className="eyebrow">For suppliers</p>
          <h2 className="mt-5 font-display text-3xl md:text-4xl">
            Build a qualified supply relationship.
          </h2>
          <p className="mt-4 max-w-lg leading-7 text-muted">
            Growers, cooperatives and exporters can declare product, origin, capacity and
            certification information for review. Submission is the start of qualification, not
            automatic approval.
          </p>
          <ButtonLink href="/sourcing/become-a-supplier" variant="outline" className="mt-8">
            Supplier requirements
          </ButtonLink>
        </Card>
      </section>
    </>
  )
}
