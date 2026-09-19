import { ArrowRight } from "lucide-react"
import { BrandLockup } from "./brand-lockup"
import { UtilityBar } from "./utility-bar"
import { DesktopNavigation } from "@/components/navigation/desktop-navigation"
import type { MarketContext } from "@/lib/market/request"
import { ButtonLink } from "@/components/ui/button"
import { MobileNavigation } from "@/components/navigation/mobile-navigation"

/**
 * Two-tier trade-desk header. `UtilityBar` and the primary row each own their
 * own `[.is-header-scrolled_&]` collapse — `HeaderScrollState` (rendered as
 * this header's preceding sibling in `layout.tsx`) is the only script
 * involved, so the state change costs one class toggle, not a re-render.
 */
export function SiteHeader({
  marketContext,
  hasSession,
}: {
  marketContext: MarketContext
  hasSession: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <UtilityBar marketContext={marketContext} hasSession={hasSession} />

      <div className="page-container flex h-[var(--header-main-height)] items-center gap-4 transition-[height] duration-200 lg:gap-6 [.is-header-scrolled_&]:h-[var(--header-sticky-height)]">
        <BrandLockup />

        <DesktopNavigation marketContext={marketContext} />

        <div className="ml-auto hidden xl:block">
          <ButtonLink
            href="/contact"
            size="md"
            className="min-w-[175px] justify-center rounded-[11px] bg-clay font-bold text-ink hover:bg-clay-inverse"
          >
            Request a Quote
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-[18px]" />
          </ButtonLink>
        </div>

        <div className="ml-auto xl:hidden">
          <MobileNavigation marketContext={marketContext} hasSession={hasSession} />
        </div>
      </div>
    </header>
  )
}
