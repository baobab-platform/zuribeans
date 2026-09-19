import { FeaturedCommodities } from "@/components/marketing/home/featured-commodities"
import { HomeHero } from "@/components/marketing/home/home-hero"
import { TradeProcess } from "@/components/marketing/home/trade-process"
import { TrustEvidenceStrip } from "@/components/marketing/home/trust-evidence-strip"
import { SectionHeading } from "@/components/marketing/section-heading"
import { MarketFootprint } from "@/components/markets/market-footprint"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getVisibleEvidence } from "@/lib/content/evidence"
import { HOME_HERO, TRUST_EVIDENCE } from "@/lib/content/homepage"
import { PUBLIC_PRODUCT_CLASSES, TRADE_STEPS } from "@/lib/content/public-estate"
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

      <section className="border-y border-line bg-sand/40 py-20 lg:py-28">
        <div className="page-container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Quality & traceability"
              title="Confidence is built from evidence."
              description="Procurement teams need useful specifications, provenance and verification status—not vague claims. ZuriBeans presents what is known, distinguishes declarations from verification, and keeps sensitive terms behind authorization."
            />
            <ButtonLink href="/quality-traceability" variant="outline" className="mt-8">
              Quality & Traceability
            </ButtonLink>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
            {[
              ["Lot context", "Origin, grade, processing and packaging where authoritative."],
              [
                "Verification",
                "Declared information remains visibly distinct from verified information.",
              ],
              [
                "Documentation",
                "Commercial and trade records follow the transaction, not an isolated webpage.",
              ],
              [
                "Access control",
                "Buyer-specific prices and terms are never treated as public catalogue content.",
              ],
            ].map(([term, detail]) => (
              <div key={term} className="bg-surface-raised p-6 transition-colors hover:bg-surface">
                <dt className="font-semibold text-ink">{term}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

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
