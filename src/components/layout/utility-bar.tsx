import Link from "next/link"
import { CircleHelp, Globe2, Handshake, UserRound } from "lucide-react"
import { MarketSwitcher } from "./market-switcher"
import type { MarketContext } from "@/lib/market/request"

/**
 * Tier 1. Collapses to zero height once `HeaderScrollState` marks the
 * document scrolled — see the `[.is-header-scrolled_&]` variants below —
 * rather than unmounting, so no layout/hydration cost on scroll beyond the
 * CSS transition itself.
 */
export function UtilityBar({
  marketContext,
  hasSession,
}: {
  marketContext: MarketContext
  hasSession: boolean
}) {
  return (
    <div
      className="hidden h-[var(--header-utility-height)] overflow-hidden border-b border-white/10 bg-ink-utility text-xs font-medium text-white/85 transition-[height,opacity] duration-200 xl:block [.is-header-scrolled_&]:h-0 [.is-header-scrolled_&]:border-b-0 [.is-header-scrolled_&]:opacity-0"
      data-testid="utility-bar"
    >
      <div className="page-container flex h-full items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <Globe2 aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-white/70" />
          <MarketSwitcher marketContext={marketContext} tone="inverse" className="min-w-0" />
        </div>

        <p className="hidden truncate font-medium text-white/80 2xl:block">
          Trusted trade. Sustainable growth. A stronger Africa.
        </p>

        <div className="flex shrink-0 items-center gap-5">
          <Link
            href="/sourcing/become-a-supplier"
            className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-clay-inverse"
          >
            <Handshake aria-hidden="true" strokeWidth={1.75} className="size-4" />
            Become a Supplier
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-clay-inverse"
          >
            <CircleHelp aria-hidden="true" strokeWidth={1.75} className="size-4" />
            Help
          </Link>
          <Link
            href={hasSession ? "/account" : "/login"}
            className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-clay-inverse"
          >
            <UserRound aria-hidden="true" strokeWidth={1.75} className="size-4" />
            {hasSession ? "Account" : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  )
}
