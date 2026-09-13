import Link from "next/link"
import type { MarketContext } from "@/lib/market/request"

const footerGroups = [
  {
    title: "Trade",
    links: [
      { href: "/origins-markets", label: "Origins & Markets" },
      { href: "/trade", label: "How we trade" },
      { href: "/quality-traceability", label: "Quality & Traceability" },
    ],
  },
  {
    title: "Partner",
    links: [
      { href: "/login", label: "Buyer portal" },
      { href: "/sourcing/become-a-supplier", label: "Become a supplier" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About ZuriBeans" },
      { href: "/products", label: "Products" },
      { href: "/sourcing", label: "Sourcing" },
    ],
  },
] as const

export function SiteFooter({ marketContext }: { marketContext: MarketContext }) {
  return (
    <footer className="bg-ink text-white">
      <div className="page-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.35fr_repeat(3,1fr)] lg:py-16">
        <div className="lg:pr-10">
          <Link href="/" className="font-display text-3xl" aria-label="ZuriBeans home">
            ZuriBeans
            <span className="text-clay" aria-hidden="true">
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
        </div>
        {footerGroups.map((group) => (
          <nav key={group.title} aria-label={`${group.title} links`}>
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              {group.links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-1 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-2 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} ZuriBeans. Business-to-business trade.</p>
          <p>
            Availability and commercial terms are authoritative only when supplied by Baobab Trade.
          </p>
        </div>
      </div>
    </footer>
  )
}
