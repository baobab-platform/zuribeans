import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"

export default async function BuyerCompanyPage() {
  const { organisation, capabilities } = await resolveBuyerAccountContext()

  if (capabilities?.organisation !== true || !organisation) {
    redirect("/account")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Company</p>
        <h2 className="mt-3 font-display text-3xl">{organisation.legal_name}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Read-only profile from Baobab Trade. Editing KYB, sites, credit and contracts is not
          enabled in this gate.
        </p>
      </div>
      <Card className="p-8">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Legal name</dt>
            <dd className="mt-1 font-semibold">{organisation.legal_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Trading name</dt>
            <dd className="mt-1 font-semibold">{organisation.trading_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Registration number
            </dt>
            <dd className="mt-1 font-semibold">{organisation.registration_number || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-1 font-semibold">{organisation.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Primary market</dt>
            <dd className="mt-1 font-semibold">{organisation.default_market_key || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Canonical organisation id
            </dt>
            <dd className="mt-1 font-mono text-sm">
              {organisation.canonical_organisation_id || "Not linked"}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
