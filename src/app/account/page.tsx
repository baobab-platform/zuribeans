import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AccountDashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <Card className="p-8">
        <p className="eyebrow">Account status</p>
        <h2 className="mt-4 font-display text-3xl">Your login is active.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Trading access is not yet approved. Catalogue pricing, quotations, orders, shipments,
          invoices and statements require a separately reviewed buyer organisation.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Identity active"],
            ["2", "Organisation review pending"],
            ["3", "Trading features restricted"],
          ].map(([number, label]) => (
            <div key={number} className="rounded-control bg-surface-muted p-4">
              <p className="font-display text-2xl text-clay">{number}</p>
              <p className="mt-2 text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-8">
        <p className="eyebrow">While access is reviewed</p>
        <h2 className="mt-4 font-display text-2xl">Explore public product information.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Public catalogue content remains available. It never substitutes account-specific price,
          inventory or eligibility.
        </p>
        <ButtonLink href="/products" variant="outline" className="mt-6">
          Browse products
        </ButtonLink>
      </Card>
    </div>
  )
}
