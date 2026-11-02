"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MarketContext } from "@/lib/market/request"
import { classNames } from "@/lib/ui/classnames"

export function MarketSwitcher({
  marketContext,
  className,
  tone = "default",
}: {
  marketContext: MarketContext
  className?: string
  tone?: "default" | "inverse"
}) {
  const pathname = usePathname()
  const otherMarkets = marketContext.enabled.filter(
    (market) => market.marketKey !== marketContext.active.marketKey,
  )

  const isInverse = tone === "inverse"

  return (
    <div className={classNames("flex flex-wrap items-center gap-2 text-sm", className)}>
      <span
        className={classNames("font-semibold", isInverse ? "text-white/70" : "text-muted-strong")}
      >
        {marketContext.active.displayName} <span aria-hidden="true">·</span>{" "}
        {marketContext.active.currency}
      </span>
      {otherMarkets.map((market) => (
        <Link
          key={market.marketKey}
          href={`${pathname}?market=${market.marketKey}`}
          className={classNames(
            "inline-flex min-h-11 items-center py-2 font-semibold underline decoration-dotted underline-offset-4",
            isInverse ? "text-clay-inverse hover:text-clay" : "text-clay hover:text-ink",
          )}
        >
          {market.displayName}
          <span className="sr-only"> market</span>
        </Link>
      ))}
    </div>
  )
}

/**
 * Figma Make's 32px trade-desk utility selector: gold "Market" label, one
 * transparent native select and the selected market's name/currency. It is
 * intentionally separate from the footer/mobile link presentation above.
 *
 * The request proxy remains the source of truth. The selected option is never
 * treated as a new market grant: only deployment-enabled, canonical candidate
 * keys are navigable, and the proxy re-resolves them on every request.
 */
export function UtilityMarketSelector({ marketContext }: { marketContext: MarketContext }) {
  const onSelectMarket = (candidate: string) => {
    const selected = marketContext.enabled.find((market) => market.marketKey === candidate)
    if (!selected || selected.marketKey === marketContext.active.marketKey) return

    // Preserve the current Next route, existing query filters and fragment.
    // A market switch is contextual navigation, not a redirect to the map.
    const url = new URL(window.location.href)
    url.searchParams.set("market", selected.marketKey)
    // A client-side query-only push can keep the root App Router layout cached,
    // including its server-resolved MarketContext and html lang. A document
    // request makes the proxy/cookie, SSR data and visible selection agree.
    window.location.assign(`${url.pathname}${url.search}${url.hash}`)
  }

  return (
    <label className="flex min-w-0 items-center gap-2" style={{ fontSize: 11 }}>
      <span className="shrink-0 font-bold text-clay">Market</span>
      <select
        aria-label="Market context"
        value={marketContext.active.marketKey}
        onChange={(event) => onSelectMarket(event.target.value)}
        className="min-w-0"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-sand)",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          maxWidth: "100%",
        }}
      >
        {marketContext.enabled.map((market) => (
          <option
            key={market.marketKey}
            value={market.marketKey}
            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-ink)" }}
          >
            {market.displayName} · {market.currency}
          </option>
        ))}
      </select>
    </label>
  )
}
