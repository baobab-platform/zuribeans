import type { Metadata } from "next"
import { CorporateHero } from "@/components/marketing/corporate-hero"
import { Card } from "@/components/ui/card"
import { TRADE_RESPONSIBILITIES } from "@/lib/content/corporate-estate"

export const metadata: Metadata = {
  title: "Trade",
  description: "How ZuriBeans structures accountable cross-border B2B trade.",
}

export default function TradePage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trade" }]}
        eyebrow="Cross-border trade"
        title="The commercial path should be legible."
        description="Professional procurement depends on a defined requirement, authoritative terms, coordinated execution and a durable transaction record."
      />
      <section className="bg-ink py-16 text-white lg:py-20">
        <div className="page-container">
          <ol className="grid gap-px overflow-hidden rounded-panel border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-4">
            {TRADE_RESPONSIBILITIES.map((item, index) => (
              <li key={item.title} className="bg-ink p-7">
                <p className="font-display text-3xl text-clay">0{index + 1}</p>
                <h2 className="mt-8 text-lg font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/65">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="page-container grid gap-6 py-20 md:grid-cols-2">
        <Card className="p-8">
          <p className="eyebrow">Public estate</p>
          <h2 className="mt-4 font-display text-3xl">Discover without exposing terms.</h2>
          <p className="mt-4 leading-7 text-muted">
            Product context can be public. Account prices, eligibility, live inventory and
            negotiated conditions remain private and contextual.
          </p>
        </Card>
        <Card className="p-8">
          <p className="eyebrow">Application layer</p>
          <h2 className="mt-4 font-display text-3xl">One boundary to the platform.</h2>
          <p className="mt-4 leading-7 text-muted">
            The browser calls ZuriBeans application services. Baobab engines remain behind adapters
            and retain authority for the domains they own.
          </p>
        </Card>
      </section>
    </>
  )
}
