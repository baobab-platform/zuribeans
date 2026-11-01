import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { requireCustomer } from "@/lib/auth/require-customer"
import { getBuyerNavigation, getUnavailableBuyerSections } from "@/lib/buyer/capabilities"
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
  const unavailable = getUnavailableBuyerSections(capabilities)

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
    <section className="min-h-[72vh] bg-surface-muted">
      <div className="border-b border-white/10 bg-ink py-8 text-canvas">
        <div className="page-container flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow-inverse">Buyer workspace / ZuriBeans</p>
            <h1 className="mt-3 font-display text-3xl font-light sm:text-4xl">
              {organisation?.legal_name || customer.company_name || "Trading account"}
            </h1>
            <p className="mt-2 text-sm text-canvas/70">
              Secure commercial access · {customer.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Badge tone={badge.tone}>{badge.label}</Badge>
            <form action={logoutAction}>
              <Button type="submit" variant="inverse">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="page-container py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Buyer workspace" }]} />
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="rounded-panel bg-ink-soft p-4 text-canvas lg:sticky lg:top-24">
            <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[.16em] text-clay-inverse">
              Workspace
            </p>
            <nav aria-label="Buyer account navigation" className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center rounded-control px-3 text-sm font-semibold text-canvas hover:bg-white/10 hover:text-canvas"
                >
                  {item.label}
                </Link>
              ))}
              {unavailable.map((item) => (
                <span
                  key={item.key}
                  className="flex min-h-11 items-center justify-between gap-2 px-3 text-sm text-canvas/50"
                  title={item.description}
                >
                  {item.label}
                  <span className="text-xs">Restricted</span>
                </span>
              ))}
            </nav>
            <div className="mt-6 border-t border-white/15 px-3 pt-5 text-sm">
              <p className="text-canvas/70">Need a product specification?</p>
              <Link
                href="/products"
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-clay-inverse underline underline-offset-4"
              >
                Browse public catalogue
              </Link>
            </div>
          </aside>
          <div className="min-w-0 rounded-panel border border-line bg-surface p-5 shadow-panel sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
