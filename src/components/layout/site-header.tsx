import Link from "next/link"
import { MarketSwitcher } from "./market-switcher"
import type { MarketContext } from "@/lib/market/request"
import { ButtonLink } from "@/components/ui/button"
import { MobileNavigation, type NavigationItem } from "@/components/navigation/mobile-navigation"

const primaryNavigation: readonly NavigationItem[] = [
  { href: "/products", label: "Products" },
  { href: "/origins-markets", label: "Origins & Markets" },
  { href: "/sourcing", label: "Sourcing" },
  { href: "/trade", label: "Trade" },
  { href: "/quality-traceability", label: "Quality & Traceability" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader({
  marketContext,
  hasSession,
}: {
  marketContext: MarketContext
  hasSession: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur supports-[backdrop-filter]:bg-ink/85">
      <div className="page-container flex min-h-20 items-center gap-4 lg:gap-6">
        <Link
          href="/"
          className="shrink-0 font-display text-2xl font-semibold tracking-tight text-white"
          aria-label="ZuriBeans home"
        >
          ZURIBEANS
          <span className="text-clay" aria-hidden="true">
            .
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 text-sm font-semibold xl:flex"
        >
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-control px-3 py-2 text-white/75 transition-colors hover:bg-white/5 hover:text-clay-inverse"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 xl:flex">
          <MarketSwitcher
            marketContext={marketContext}
            tone="inverse"
            className="max-w-56 justify-end"
          />
          <Link
            href={hasSession ? "/account" : "/login"}
            className="whitespace-nowrap py-2 text-sm font-semibold text-white/85 transition-colors hover:text-clay-inverse"
          >
            {hasSession ? "Account" : "Portal sign in"}
          </Link>
          <ButtonLink
            href="/products"
            size="sm"
            className="bg-clay text-ink hover:bg-clay-inverse"
          >
            Explore products
          </ButtonLink>
        </div>

        <div className="ml-auto xl:hidden">
          <MobileNavigation
            items={primaryNavigation}
            marketContext={marketContext}
            hasSession={hasSession}
          />
        </div>
      </div>
    </header>
  )
}