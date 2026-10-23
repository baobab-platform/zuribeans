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
    <section
      className="bg-canvas py-14 sm:py-20 lg:py-24"
      aria-label="Featured commodities"
    >
      <div className="page-container grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
        <SectionHeading
          eyebrow="Procurement catalogue"
          title="Origin-led commodities. Grade-documented for trade."
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
        className="page-container mt-9 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:auto-cols-fr xl:grid-flow-col"
      >
        {commodities.map((commodity) => (
          <CommodityCard key={commodity.id} commodity={commodity} />
        ))}
      </div>
    </section>
  )
}
