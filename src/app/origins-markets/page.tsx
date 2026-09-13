import type { Metadata } from "next"
import { CorporateHero } from "@/components/marketing/corporate-hero"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MARKET_CAPABILITY } from "@/lib/content/corporate-estate"
import { getMarket } from "@/lib/market/markets"

export const metadata: Metadata = {
  title: "Origins & markets",
  description: "Understand ZuriBeans operating roles in Uganda and South Africa.",
}

export default function OriginsAndMarketsPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Origins & markets" }]}
        eyebrow="Origins & markets"
        title="Market context is part of the trade."
        description="ZuriBeans begins with distinct operating contexts in Uganda and South Africa. New markets can enter the same model without embedding country exceptions in presentation components."
      />
      <section className="bg-ink py-16 text-white lg:py-20">
        <div className="page-container grid gap-6 md:grid-cols-2">
          {MARKET_CAPABILITY.map((capability) => {
            const market = getMarket(capability.marketKey)
            return (
              <article
                key={capability.marketKey}
                className="rounded-panel border border-white/15 bg-white/5 p-8"
              >
                <p className="text-sm font-semibold text-clay">{capability.operatingRole}</p>
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-4xl">{market.displayName}</h2>
                  <span className="text-sm text-white/60">{market.currency}</span>
                </div>
                <p className="mt-5 leading-7 text-white/70">{capability.description}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {capability.focus.map((item) => (
                    <Badge key={item} className="bg-white/10 text-white">
                      {item}
                    </Badge>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>
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
