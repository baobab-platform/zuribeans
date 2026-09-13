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
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="page-container flex min-h-20 items-center gap-5">
        <Link
          href="/"
          className="shrink-0 font-display text-2xl font-semibold tracking-tight"
          aria-label="ZuriBeans home"
        >
          ZURIBEANS
          <span className="text-clay" aria-hidden="true">
            .
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="ml-auto hidden items-center gap-5 text-sm font-semibold xl:flex"
        >
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap py-2 text-muted-strong hover:text-clay"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-5 xl:flex">
          <MarketSwitcher marketContext={marketContext} className="max-w-64 justify-end" />
          <Link
            href={hasSession ? "/account" : "/login"}
            className="whitespace-nowrap py-2 text-sm font-semibold hover:text-clay"
          >
            {hasSession ? "Account" : "Portal sign in"}
          </Link>
          <ButtonLink href="/products" size="sm">
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
