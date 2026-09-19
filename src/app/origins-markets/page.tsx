import { CorporateHero } from "@/components/marketing/corporate-hero"
import { MarketFootprint } from "@/components/markets/market-footprint"
import { Card } from "@/components/ui/card"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "Origins & markets",
  description: "Understand ZuriBeans operating roles in Uganda and South Africa.",
  path: "/origins-markets",
})

export default function OriginsAndMarketsPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Origins & markets" }]}
        eyebrow="Origins & markets"
        title="Market context is part of the trade."
        description="ZuriBeans begins with distinct operating contexts in Uganda and South Africa. New markets can enter the same model without embedding country exceptions in presentation components."
      />
      <MarketFootprint detailed />
      <section className="page-container py-20">
        <Card className="p-8 md:p-10">
          <p className="eyebrow">Expansion principle</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl">
            A market is not a decorative selector.
          </h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            Currency, catalogue eligibility, price, inventory, tax, logistics and authorization
            remain governed by their authoritative services. The interface receives normalized
            market context and does not invent those rules.
          </p>
        </Card>
      </section>
    </>
  )
}
