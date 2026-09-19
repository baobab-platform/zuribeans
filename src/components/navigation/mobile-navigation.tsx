"use client"

import Link from "next/link"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button, ButtonLink } from "@/components/ui/button"
import { MarketSwitcher } from "@/components/layout/market-switcher"
import type { MarketContext } from "@/lib/market/request"

export type NavigationItem = { href: string; label: string }

export function MobileNavigation({
  items,
  marketContext,
  hasSession,
}: {
  items: readonly NavigationItem[]
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
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
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
            {items.map((item) => (
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ButtonLink
            href={hasSession ? "/account" : "/login"}
            className="w-full bg-clay text-ink hover:bg-clay-inverse"
            size="lg"
          >
            {hasSession ? "Open account" : "Portal sign in"}
          </ButtonLink>
          <ButtonLink href="/supplier" className="w-full" size="lg" variant="outline">
            Supplier portal
          </ButtonLink>
        </div>
      </Dialog>
    </div>
  )
}