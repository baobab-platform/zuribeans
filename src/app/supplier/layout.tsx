import type { Metadata } from "next"
import Link from "next/link"
import { requireCustomer } from "@/lib/auth/require-customer"
import { logoutAction } from "@/app/account/actions"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Supplier account",
  robots: { index: false, follow: false },
}

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const customer = await requireCustomer("/supplier")

  return (
    <section className="page-container py-12 lg:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Supplier account" }]} />
      <div className="mt-8 flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Supplier account</p>
          <h1 className="mt-3 font-display text-4xl">Supplier workspace</h1>
          <p className="mt-2 text-sm text-muted">Signed in as {customer.email}</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <nav className="mt-6 flex gap-2 border-b border-line" aria-label="Supplier navigation">
        <Link
          href="/supplier"
          aria-current="page"
          className="border-b-2 border-ink px-3 py-3 text-sm font-semibold"
        >
          Overview
        </Link>
      </nav>
      <div className="mt-10">{children}</div>
    </section>
  )
}
