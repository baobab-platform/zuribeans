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
