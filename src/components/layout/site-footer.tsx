import Link from "next/link"
import { MarketSwitcher } from "./market-switcher"
import type { MarketContext } from "@/lib/market/request"
import { PUBLIC_PRODUCT_CLASSES } from "@/lib/content/public-estate"

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const

function getFooterGroups(marketContext: MarketContext) {
  return [
    {
      title: "Products",
      links: [
        { href: "/products", label: "Catalogue" },
        ...PUBLIC_PRODUCT_CLASSES.map((productClass) => ({
          href: productClass.href,
          label: productClass.name,
        })),
      ],
    },
    {
      title: "Trade",
      links: [
        { href: "/trade", label: "How we trade" },
        { href: "/quality-traceability", label: "Quality & Traceability" },
        { href: "/origins-markets", label: "All markets" },
        ...marketContext.enabled.map((market) => ({
          href: `/origins-markets?market=${market.marketKey}`,
          label: market.displayName,
        })),
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About ZuriBeans" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Sourcing",
      links: [
        { href: "/sourcing", label: "Sourcing" },
        { href: "/sourcing/become-a-supplier", label: "Become a supplier" },
        { href: "/supplier", label: "Supplier portal" },
      ],
    },
    {
      title: "Partner",
      links: [
        { href: "/login", label: "Buyer portal" },
        { href: "/contact", label: "Discuss a requirement" },
        { href: "/register", label: "Register" },
      ],
    },
  ] as const
}

export function SiteFooter({ marketContext }: { marketContext: MarketContext }) {
  const footerGroups = getFooterGroups(marketContext)

  return (
    <footer className="bg-ink text-white" data-tone="inverse" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer navigation
      </h2>
      <div className="page-container py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2.2fr)] lg:gap-16">
          <div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-display text-3xl text-white"
              aria-label="ZuriBeans home"
            >
              ZuriBeans
              <span className="text-clay-inverse" aria-hidden="true">
                .
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              A B2B sourcing and trading company connecting verified products, origin capability and
              professional buyers across African markets.
            </p>
            <div className="mt-6 border-y border-white/10 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-inverse">
                Trading market
              </p>
              <MarketSwitcher marketContext={marketContext} tone="inverse" className="mt-2" />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              Availability and commercial terms are authoritative only when supplied by Baobab
              Trade.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={`${group.title} links`}>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-clay">
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-1 text-sm text-white/65">
                  {group.links.map((item) => (
                    <li key={`${group.title}-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        className="flex min-h-11 items-center py-2 transition-colors hover:text-clay-inverse"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-3 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} ZuriBeans. A subsidiary of Nabhold Group Africa.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center transition-colors hover:text-clay-inverse"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { legalLinks }
