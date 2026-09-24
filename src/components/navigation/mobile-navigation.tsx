"use client"

import Link from "next/link"
import { ArrowRight, Menu } from "lucide-react"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button, ButtonLink } from "@/components/ui/button"
import { MarketSwitcher } from "@/components/layout/market-switcher"
import type { MarketContext } from "@/lib/market/request"

/**
 * Flat mirror of the desktop's six grouped nav entries, each resolved to its
 * single most useful destination — a mobile drawer lists journeys, it does
 * not nest disclosures inside a disclosure. Commodities and Trade sub-items
 * remain one tap away on their landing pages.
 */
const primaryNavigation = [
  { href: "/products", label: "Commodities" },
  { href: "/origins-markets", label: "Markets" },
  { href: "/trade", label: "Trade" },
  { href: "/about", label: "About Us" },
  { href: "/quality-traceability", label: "Resources" },
  { href: "/contact", label: "Contact" },
] as const

export function MobileNavigation({
  marketContext,
  hasSession,
}: {
  marketContext: MarketContext
  hasSession: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="xl:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="border border-white/25 text-white hover:bg-white/10 hover:text-white"
      >
        <Menu aria-hidden="true" strokeWidth={1.75} className="size-5" />
        Menu
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Explore ZuriBeans"
        description="Products, trade capabilities and partner portals."
      >
        <nav aria-label="Mobile navigation">
          <ul className="divide-y divide-line border-y border-line">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-base font-semibold transition-colors hover:text-clay"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 border-b border-line pb-6">
          <p className="eyebrow">Trading market</p>
          <MarketSwitcher marketContext={marketContext} className="mt-3" />
        </div>
        <div className="mt-6 grid gap-3">
          <ButtonLink
            href="/contact"
            onClick={() => setOpen(false)}
            className="w-full bg-clay text-ink hover:bg-clay-inverse"
            size="lg"
          >
            Request a Quote
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
          </ButtonLink>
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink
              href={hasSession ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {hasSession ? "Open account" : "Portal sign in"}
            </ButtonLink>
            <ButtonLink
              href="/sourcing/become-a-supplier"
              onClick={() => setOpen(false)}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Become a Supplier
            </ButtonLink>
            <ButtonLink
              href="/supplier"
              onClick={() => setOpen(false)}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Supplier Portal
            </ButtonLink>
            <ButtonLink
              href="/help"
              onClick={() => setOpen(false)}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Help
            </ButtonLink>
            <ButtonLink
              href="/insights"
              onClick={() => setOpen(false)}
              className="w-full"
              size="lg"
              variant="outline"
            >
              Insights
            </ButtonLink>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
