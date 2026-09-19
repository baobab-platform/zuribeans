import Link from "next/link"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeHero } from "@/components/marketing/home/home-hero"
import { TrustEvidenceStrip } from "@/components/marketing/home/trust-evidence-strip"
import { SectionHeading } from "@/components/marketing/section-heading"
import { getMarketContext } from "@/lib/market/request"
import { getMarket } from "@/lib/market/markets"
import { getPublicPageMetadata } from "@/lib/seo/metadata"
import { HOME_HERO, TRUST_EVIDENCE } from "@/lib/content/homepage"
import { getVisibleEvidence } from "@/lib/content/evidence"
import {
  PUBLIC_MARKET_SUMMARIES,
  PUBLIC_PRODUCT_CLASSES,
  TRADE_STEPS,
} from "@/lib/content/public-estate"

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

      {/* ── Product classes ── */}
      <section className="page-container py-20 lg:py-28">
        <SectionHeading
          eyebrow="Product classes"
          title="Specified for decisions, not dressed for a shelf."
          description="The catalogue is designed for professional evaluation across current and future agricultural product classes. Commercially sensitive terms remain available only to authorized buyers."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PUBLIC_PRODUCT_CLASSES.map((productClass, index) => (
            <Link key={productClass.name} href={productClass.href} className="group">
              <Card className="relative h-full overflow-hidden transition-all group-hover:-translate-y-1 group-hover:shadow-panel">
                <div className="h-2 bg-leaf" aria-hidden="true" />
                <div className="relative p-8 md:p-10">
                  <span
                    className="absolute right-6 top-6 font-display text-6xl text-sand/80"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <p className="eyebrow relative">{productClass.eyebrow}</p>
                  <h3 className="relative mt-5 font-display text-3xl md:text-4xl">
                    {productClass.name}
                  </h3>
                  <p className="relative mt-4 max-w-lg leading-7 text-muted">
                    {productClass.description}
                  </p>
                  <p className="relative mt-8 inline-flex items-center gap-1 font-semibold text-clay transition-colors group-hover:text-clay-inverse">
                    {productClass.actionLabel}
                    <span aria-hidden="true">→</span>
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Origins & Markets ── */}
      <section className="bg-ink py-20 text-white lg:min-h-[900px] lg:py-28">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <SectionHeading
              eyebrow="Origins & markets"
              title="Local capability. Cross-border discipline."
              description="ZuriBeans begins with distinct operating contexts in Uganda and South Africa. The platform is designed to add markets without teaching every page a new exception."
              tone="inverse"
            />
            <p className="max-w-xl justify-self-end text-base leading-7 text-white/65">
              A market is more than a currency selector. Eligibility, pricing, inventory, tax,
              logistics and authorization remain the responsibility of the Baobab services that own
              them.
            </p>
          </div>

          {/* Interactive map zone — sized per Figma (~520px) */}
          <div className="relative mt-12 min-h-[320px] overflow-hidden rounded-panel border border-white/15 bg-ink-soft lg:min-h-[520px]">
            <div className="absolute left-5 top-5 z-10 flex items-center gap-4 rounded-control bg-ink/70 px-4 py-2 text-xs font-semibold backdrop-blur">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-clay" aria-hidden="true" />
                Origin
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-clay-inverse" aria-hidden="true" />
                Destination
              </span>
            </div>
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center lg:min-h-[520px]">
              <p className="text-sm font-semibold text-clay-inverse">Interactive map</p>
              <p className="max-w-md text-sm leading-6 text-white/50">
                Origin and destination markets with trade-lane context. Click markers for market
                detail.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {PUBLIC_MARKET_SUMMARIES.map((summary) => {
              const item = getMarket(summary.marketKey)
              return (
                <article
                  key={summary.marketKey}
                  className="rounded-panel border border-white/15 bg-white/5 p-8 transition-colors hover:bg-white/8 md:p-9"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-clay-inverse">
                        {summary.role}
                      </p>
                      <h3 className="mt-2 font-display text-3xl md:text-4xl">{item.displayName}</h3>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                      {item.currency}
                    </span>
                  </div>
                  <p className="mt-5 max-w-xl leading-7 text-white/70">{summary.summary}</p>
                  <Link
                    href="/origins-markets"
                    className="mt-7 inline-flex items-center gap-1 font-semibold text-clay-inverse transition-colors hover:text-clay"
                  >
                    View markets
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How ZuriBeans trades ── */}
      <section className="page-container py-20 lg:py-28">
        <SectionHeading
          eyebrow="How ZuriBeans trades"
          title="A clear commercial path from requirement to record."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {TRADE_STEPS.map((step) => (
            <li key={step.number} className="bg-surface-raised p-7">
              <div className="flex size-12 items-center justify-center rounded-full bg-ink font-display text-lg text-clay">
                {step.number}
              </div>
              <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Quality & Traceability ── */}
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

      {/* ── Final dual CTA ── */}
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
