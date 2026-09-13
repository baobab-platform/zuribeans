"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { classNames } from "@/lib/ui/classnames"

export function SupplierNavigation() {
  const isOverview = usePathname() === "/supplier"

  return (
    <nav className="mt-6 flex gap-2 border-b border-line" aria-label="Supplier navigation">
      <Link
        href="/supplier"
        aria-current={isOverview ? "page" : undefined}
        className={classNames(
          "border-b-2 px-3 py-3 text-sm font-semibold",
          isOverview
            ? "border-ink text-ink"
            : "border-transparent text-muted-strong hover:border-line-strong hover:text-ink",
        )}
      >
        Overview
      </Link>
    </nav>
  )
}
