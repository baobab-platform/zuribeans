import Link from "next/link"
import type { MarketContext } from "@/lib/market/request"

const footerGroups = [
  {
    title: "Products",
    links: [
      { href: "/products", label: "Catalogue" },
      { href: "/products?category=coffee", label: "Green coffee" },
      { href: "/products?category=vanilla", label: "Vanilla pods" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About ZuriBeans" },
      { href: "/quality-traceability", label: "Quality & Traceability" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Trade",
    links: [
      { href: "/trade", label: "How we trade" },
      { href: "/origins-markets", label: "Origins & Markets" },
      { href: "/quality-traceability", label: "Traceability" },
    ],
  },
  {
    title: "Markets",
    links: [
      { href: "/origins-markets", label: "Uganda" },
      { href: "/origins-markets", label: "South Africa" },
      { href: "/origins-markets", label: "All markets" },
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

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const

export function SiteFooter({ marketContext }: { marketContext: MarketContext }) {
  return (
    <footer className="bg-ink text-white" data-tone="inverse">
      <div className="page-container py-14 lg:py-16">
        {/* Layout C — asymmetric brand column + 2×3 link grid */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2.2fr)] lg:gap-16">
          {/* Brand column */}
          <div>
            <Link href="/" className="font-display text-3xl text-white" aria-label="ZuriBeans home">
              ZuriBeans
              <span className="text-clay-inverse" aria-hidden="true">
                .
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              A B2B sourcing and trading company connecting verified products, origin capability and
              professional buyers across African markets.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              {marketContext.active.displayName} · {marketContext.active.currency}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              Availability and commercial terms are authoritative only when supplied by Baobab
              Trade.
            </p>
          </div>

          {/* Link grid — 2 rows × 3 columns from sm upward */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={`${group.title} links`}>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-clay">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-white/65">
                  {group.links.map((item) => (
                    <li key={`${group.title}-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        className="inline-block py-0.5 transition-colors hover:text-clay-inverse"
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

      {/* Legal bar */}
      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-3 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} ZuriBeans. A subsidiary of Nabhold Group Africa.</p>
          <div className="flex flex-col gap-2 sm:items-end">
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-clay-inverse">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
