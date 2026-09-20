import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/form-controls"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import {
  listOrganisationMembers,
  listTaxRegistrations,
  BuyerTradeError,
} from "@/lib/buyer/trade-client"
import { addTaxRegistrationAction } from "./actions"

const errorMessages: Record<string, string> = {
  invalid_input: "Check tax registration fields.",
  forbidden: "Only an account admin can add tax registrations.",
  duplicate: "That tax registration already exists.",
  failed: "Could not save tax registration.",
}

export default async function BuyerCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tax?: string }>
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/company")

  const { organisation, capabilities } = await resolveBuyerAccountContext()

  if (capabilities?.organisation !== true || !organisation) {
    redirect("/account")
  }

  let taxRegistrations: Awaited<ReturnType<typeof listTaxRegistrations>> = []
  let canEditTax = false
  try {
    taxRegistrations = await listTaxRegistrations(organisation.id)
    const members = await listOrganisationMembers(organisation.id)
    canEditTax =
      members.find((m) => m.customer_id === customer.id)?.roles.includes("ACCOUNT_ADMIN") === true
  } catch (error) {
    if (error instanceof BuyerTradeError && error.code === "unauthorized") {
      redirect("/login?next=/account/company")
    }
  }

  const { error, tax } = await searchParams
  const errorMessage = error ? errorMessages[error] : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Company</p>
        <h2 className="mt-3 font-display text-3xl">{organisation.legal_name}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Profile from Baobab Trade. Tax registrations start as PENDING until staff verification.
        </p>
      </div>

      {tax ? (
        <Alert title="Tax registration saved" tone="success">
          Submitted for verification.
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert title="Not saved" tone="danger">
          {errorMessage}
        </Alert>
      ) : null}

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

      <Card className="space-y-4 p-8">
        <h3 className="font-display text-xl">Tax registrations</h3>
        {taxRegistrations.length === 0 ? (
          <p className="text-sm text-muted">No tax registrations on file.</p>
        ) : (
          <ul className="space-y-3">
            {taxRegistrations.map((reg) => (
              <li
                key={reg.id}
                className="flex flex-col gap-2 rounded-control border border-line p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {reg.registration_type} · {reg.registration_number}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {reg.country_code} · {reg.market_key}
                  </p>
                </div>
                <Badge tone={reg.status === "VERIFIED" ? "success" : "warning"}>{reg.status}</Badge>
              </li>
            ))}
          </ul>
        )}

        {canEditTax ? (
          <form action={addTaxRegistrationAction} className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Market key
              <Select name="marketKey" defaultValue={organisation.default_market_key || "zuribeans_za"}>
                <option value="zuribeans_za">zuribeans_za</option>
                <option value="zuribeans_ug">zuribeans_ug</option>
              </Select>
            </label>
            <label className="block text-sm font-semibold">
              Country
              <Select name="countryCode" defaultValue="ZA">
                <option value="ZA">ZA</option>
                <option value="UG">UG</option>
              </Select>
            </label>
            <label className="block text-sm font-semibold">
              Type
              <Select name="registrationType" defaultValue="VAT">
                <option value="VAT">VAT</option>
                <option value="TIN">TIN</option>
                <option value="IMPORTER">Importer</option>
                <option value="EXPORTER">Exporter</option>
                <option value="OTHER">Other</option>
              </Select>
            </label>
            <label className="block text-sm font-semibold">
              Number
              <Input name="registrationNumber" type="text" required />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">Add tax registration</Button>
            </div>
          </form>
        ) : null}
      </Card>
    </div>
  )
}
