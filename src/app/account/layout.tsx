import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { requireCustomer } from "@/lib/auth/require-customer"
import { getBuyerNavigation } from "@/lib/buyer/capabilities"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { logoutAction } from "./actions"

export const metadata: Metadata = {
  title: "Buyer account",
  robots: { index: false, follow: false },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await requireCustomer("/account")
  const { organisation, capabilities } = await resolveBuyerAccountContext()
  const navigation = getBuyerNavigation(capabilities)

  const badge =
    organisation?.status === "ACTIVE"
      ? { tone: "success" as const, label: "Organisation active" }
      : organisation?.status === "PENDING"
        ? { tone: "warning" as const, label: "Trading review pending" }
        : organisation?.status === "SUSPENDED"
          ? { tone: "danger" as const, label: "Organisation suspended" }
          : organisation?.status === "CLOSED"
            ? { tone: "danger" as const, label: "Organisation closed" }
            : { tone: "warning" as const, label: "Trading review pending" }

  return (
    <section className="page-container py-12 lg:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Buyer account" }]} />
      <div className="mt-8 flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">Buyer account</p>
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </div>
          <h1 className="mt-3 font-display text-4xl">
            {organisation?.legal_name || customer.company_name || customer.email}
          </h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <nav className="mt-6 flex gap-2 border-b border-line" aria-label="Buyer account navigation">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-b-2 border-transparent px-3 py-3 text-sm font-semibold hover:border-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-10">{children}</div>
    </section>
  )
}
