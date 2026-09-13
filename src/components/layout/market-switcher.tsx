"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MarketContext } from "@/lib/market/request"
import { classNames } from "@/lib/ui/classnames"

export function MarketSwitcher({
  marketContext,
  className,
}: {
  marketContext: MarketContext
  className?: string
}) {
  const pathname = usePathname()
  const otherMarkets = marketContext.enabled.filter(
    (market) => market.marketKey !== marketContext.active.marketKey,
  )

  return (
    <div className={classNames("flex flex-wrap items-center gap-2 text-sm", className)}>
      <span className="font-semibold text-muted-strong">
        {marketContext.active.displayName} <span aria-hidden="true">·</span>{" "}
        {marketContext.active.currency}
      </span>
      {otherMarkets.map((market) => (
        <Link
          key={market.marketKey}
          href={`${pathname}?market=${market.marketKey}`}
          className="py-1 font-semibold text-clay underline decoration-dotted underline-offset-4 hover:text-ink"
        >
          {market.displayName}
          <span className="sr-only"> market</span>
        </Link>
      ))}
    </div>
  )
}
