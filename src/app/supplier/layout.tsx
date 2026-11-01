import type { Metadata } from "next"
import Link from "next/link"
import { requireCustomer } from "@/lib/auth/require-customer"
import { logoutAction } from "@/app/account/actions"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"
import { SupplierNavigation } from "@/components/supplier/supplier-navigation"

export const metadata: Metadata = {
  title: "Supplier workspace",
  robots: { index: false, follow: false },
}

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const customer = await requireCustomer("/supplier")

  return (
    <section className="min-h-[72vh] bg-surface-muted">
      <header className="bg-ink py-8 text-canvas">
        <div className="page-container flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow-inverse">Supplier workspace / ZuriBeans</p>
            <h1 className="mt-3 font-display text-3xl font-light sm:text-4xl">
              Supplier relationship
            </h1>
            <p className="mt-2 text-sm text-canvas/70">Sourcing review and qualification · {customer.email}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="border-white/40 text-canvas hover:bg-white/10 hover:text-canvas">Sign out</Button>
          </form>
        </div>
      </header>
      <div className="page-container py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Supplier workspace" }]} />
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="rounded-panel bg-ink-soft p-4 text-canvas lg:sticky lg:top-24">
            <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[.16em] text-clay-inverse">Sourcing workspace</p>
            <SupplierNavigation />
            <div className="mt-6 border-t border-white/15 px-3 pt-5 text-sm">
              <p className="text-canvas/70">Independent qualification required.</p>
              <Link href="/sourcing/become-a-supplier" className="mt-2 inline-flex min-h-11 items-center text-clay-inverse underline underline-offset-4">Application requirements</Link>
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
