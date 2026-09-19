import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { MarketSummaryPresentation } from "@/lib/content/market-presentation"

export function MarketSummaryCard({
  market,
  showFocus = false,
}: {
  market: MarketSummaryPresentation
  showFocus?: boolean
}) {
  return (
    <article className="group rounded-panel border border-white/15 bg-white/5 p-7 transition-colors hover:bg-white/8 md:p-9">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-clay-inverse">{market.role}</p>
          <h3 className="mt-2 font-display text-3xl text-white md:text-4xl">{market.name}</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
          {market.currency}
        </span>
      </div>
      <p className="mt-5 max-w-xl leading-7 text-white/70">{market.summary}</p>
      {showFocus ? (
        <div className="mt-7 flex flex-wrap gap-2">
          {market.focus.map((item) => (
            <Badge key={item} className="bg-white/10 text-white">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <Link
          href="/origins-markets"
          className="mt-7 inline-flex items-center gap-2 font-semibold text-clay-inverse transition-colors group-hover:text-clay"
        >
          Explore this market <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  )
}
