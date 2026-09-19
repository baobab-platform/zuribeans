import { CommodityCard } from "@/components/commodities/commodity-card"
import { SectionHeading } from "@/components/marketing/section-heading"
import type { CommodityPresentation } from "@/lib/content/commodity"

type FeaturedCommoditiesProps = {
  commodities: readonly CommodityPresentation[]
}

export function FeaturedCommodities({ commodities }: FeaturedCommoditiesProps) {
  if (commodities.length === 0) {
    return null
  }

  return (
    <section className="page-container py-24 lg:py-32" aria-labelledby="featured-commodities">
      <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
        <SectionHeading
          eyebrow="Featured commodities"
          title="Specified for decisions, not dressed for a shelf."
          description="Professional product discovery with origin and specification context. Commercially sensitive prices, availability and terms remain behind the authoritative trading boundary."
        />
        <p className="max-w-xl text-base leading-7 text-muted lg:justify-self-end">
          Coffee and vanilla are the initial focus—not the limit. The same presentation model
          supports additional commodity classes without embedding coffee-specific rules in the
          interface.
        </p>
      </div>
      <div
        id="featured-commodities"
        className="mt-12 grid gap-6 md:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col"
      >
        {commodities.map((commodity) => (
          <CommodityCard key={commodity.id} commodity={commodity} />
        ))}
      </div>
    </section>
  )
}
