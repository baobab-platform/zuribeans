import { MarketSummaryCard } from "@/components/markets/market-summary-card"
import { TradeMap } from "@/components/markets/trade-map"
import { SectionHeading } from "@/components/marketing/section-heading"
import {
  MARKET_SUMMARY_PRESENTATIONS,
  TRADE_MAP_LOCATIONS,
} from "@/lib/content/market-presentation"

export function MarketFootprint({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="bg-ink py-20 text-white lg:py-28">
      <div className="page-container">
        {!detailed ? (
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <SectionHeading
              eyebrow="Origins & markets"
              title="Local capability. Cross-border discipline."
              description="Two distinct operating contexts, expressed through one durable market model."
              tone="inverse"
            />
            <p className="max-w-xl justify-self-end text-base leading-7 text-white/65">
              Market context informs the experience without transferring authority for eligibility,
              pricing, inventory, tax or logistics into the presentation layer.
            </p>
          </div>
        ) : null}

        <TradeMap locations={TRADE_MAP_LOCATIONS} />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {MARKET_SUMMARY_PRESENTATIONS.map((market) => (
            <MarketSummaryCard key={market.marketKey} market={market} showFocus={detailed} />
          ))}
        </div>
      </div>
    </section>
  )
}
