"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/supplier", label: "Overview" },
  { href: "/supplier/apply", label: "Application" },
  { href: "/sourcing/become-a-supplier", label: "Requirements" },
] as const

export function SupplierNavigation() {
  const pathname = usePathname()
  return (
    <nav aria-label="Supplier navigation" className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className="flex min-h-11 items-center rounded-control px-3 text-sm font-semibold text-canvas hover:bg-white/10 hover:text-canvas aria-[current=page]:bg-white/15"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
