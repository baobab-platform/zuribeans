import Link from "next/link"
import { PUBLIC_PRODUCT_CLASSES } from "@/lib/content/public-estate"
import type { MarketContext } from "@/lib/market/request"
import { NavDisclosure, type NavDisclosureItem } from "./nav-disclosure"

const navLinkClassName =
  "whitespace-nowrap rounded-control px-3 py-2 text-white/85 transition-colors hover:bg-white/5 hover:text-clay-inverse"

/**
 * Grouped in place of the old seven flat links. Commodities reuses the same
 * `PUBLIC_PRODUCT_CLASSES` content the homepage renders, and Markets is built
 * from the request's own `MarketContext`, so this component never hardcodes
 * a product class or a market name — the IA doc's ban on branching public
 * components on "coffee" or "Uganda" applies to navigation too.
 */
export function DesktopNavigation({ marketContext }: { marketContext: MarketContext }) {
  const commodities: NavDisclosureItem[] = [
    { href: "/products", label: "View all commodities" },
    ...PUBLIC_PRODUCT_CLASSES.map((productClass) => ({
      href: productClass.href,
      label: productClass.name,
    })),
  ]

  const markets: NavDisclosureItem[] = [
    { href: "/origins-markets", label: "Origins & Markets" },
    ...marketContext.enabled.map((market) => ({
      href: `/origins-markets?market=${market.marketKey}`,
      label: market.displayName,
    })),
  ]

  const trade: NavDisclosureItem[] = [
    { href: "/trade", label: "How We Trade" },
    { href: "/sourcing", label: "Sourcing" },
  ]

  const resources: NavDisclosureItem[] = [
    { href: "/quality-traceability", label: "Quality & Traceability" },
    { href: "/sourcing/become-a-supplier", label: "Become a Supplier" },
    { href: "/supplier", label: "Supplier Portal" },
    { href: "/help", label: "Help" },
  ]

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 text-sm font-semibold xl:flex"
    >
      <NavDisclosure label="Commodities" items={commodities} />
      <NavDisclosure label="Markets" items={markets} />
      <NavDisclosure label="Trade" items={trade} />
      <Link href="/about" className={navLinkClassName}>
        About Us
      </Link>
      <NavDisclosure label="Resources" items={resources} />
      <Link href="/contact" className={navLinkClassName}>
        Contact
      </Link>
    </nav>
  )
}
