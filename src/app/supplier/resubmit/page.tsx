import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, Input, Select } from "@/components/ui/form-controls"
import { ErrorState } from "@/components/ui/state-panel"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { SUPPLIER_CAPABILITY_CATEGORIES } from "@/lib/supplier/categories"
import { getSupplierApplicationForCustomer } from "@/lib/supplier/repository"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"
import { resubmitSupplierApplicationAction } from "./actions"

const CAPABILITY_SLOTS = [0, 1, 2]
const CERTIFICATION_SLOTS = [0, 1, 2]
const labelClass = "block text-sm font-semibold"

const EDITABLE: SupplierStatus[] = ["more_information_required", "sample_required"]

export default async function SupplierResubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/supplier/resubmit")

  let application: Awaited<ReturnType<typeof getSupplierApplicationForCustomer>>
  try {
    application = await getSupplierApplicationForCustomer(customer.id)
  } catch {
    return (
      <ErrorState
        title="Unable to load application"
        description="Please try again shortly."
        action={{ href: "/supplier/resubmit", label: "Try again" }}
      />
    )
  }

  if (!application) redirect("/supplier/apply")
  if (!EDITABLE.includes(application.organisation.status as SupplierStatus)) {
    redirect("/supplier")
  }

  const { error } = await searchParams
  const org = application.organisation

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Update application</p>
      <h2 className="mt-4 font-display text-4xl">Respond to sourcing review</h2>
      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Update your details and resubmit. This returns the application to under review — it does not
        approve your organisation as a supplier.
      </p>
      {error ? (
        <Alert title="Could not resubmit" tone="danger" className="mt-6">
          {error === "invalid_input"
            ? "Check required fields and at least one product capability."
            : error === "not_editable"
              ? "This application is no longer open for applicant edits."
              : "Please try again."}
        </Alert>
      ) : null}
      <form action={resubmitSupplierApplicationAction} className="mt-10 space-y-8">
        <fieldset className="space-y-5 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Organisation</legend>
          <label className={labelClass}>
            Legal name
            <Input name="legalName" type="text" required defaultValue={org.legalName} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Registration number
              <Input
                name="registrationNumber"
                type="text"
                defaultValue={org.registrationNumber ?? ""}
              />
            </label>
            <label className={labelClass}>
              Tax identifier
              <Input name="taxIdentifier" type="text" defaultValue={org.taxIdentifier ?? ""} />
            </label>
          </div>
          <label className={labelClass}>
            Country
            <Input
              name="countryCode"
              type="text"
              required
              maxLength={2}
              defaultValue={org.countryCode}
              className="uppercase"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-5 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Primary contact</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <Input name="contactName" type="text" required />
            </label>
            <label className={labelClass}>
              Role
              <Input name="contactRole" type="text" required />
            </label>
            <label className={labelClass}>
              Email
              <Input name="contactEmail" type="email" required />
            </label>
            <label className={labelClass}>
              Phone
              <Input name="contactPhone" type="tel" />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-6 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">What can you supply?</legend>
          {CAPABILITY_SLOTS.map((slot) => (
            <div key={slot} className="rounded-control border border-line bg-surface p-5">
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Category
                  <Select name="capability_category" defaultValue="" required={slot === 0}>
                    <option value="">Select…</option>
                    {SUPPLIER_CAPABILITY_CATEGORIES.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className={labelClass}>
                  Variety
                  <Input name="capability_variety" type="text" />
                </label>
                <label className={labelClass}>
                  Grade
                  <Input name="capability_grade" type="text" />
                </label>
                <label className={labelClass}>
                  Origin country
                  <Input
                    name="capability_origin_country"
                    type="text"
                    maxLength={2}
                    className="uppercase"
                  />
                </label>
                <label className={labelClass}>
                  Capacity
                  <Input name="capability_capacity" type="text" />
                </label>
                <label className={labelClass}>
                  Season
                  <Input name="capability_season" type="text" />
                </label>
                <label className={labelClass}>
                  Lead time (days)
                  <Input name="capability_lead_time_days" type="number" min={0} />
                </label>
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-6 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Certifications</legend>
          <Alert title="No document upload" tone="info">
            Metadata only. Secure blob storage is not provisioned (ADR-0006 / ADR-0012).
          </Alert>
          {CERTIFICATION_SLOTS.map((slot) => (
            <div key={slot} className="rounded-control border border-line bg-surface p-5">
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Type
                  <Input name="certification_type" type="text" />
                </label>
                <label className={labelClass}>
                  Issuer
                  <Input name="certification_issuer" type="text" />
                </label>
                <label className={labelClass}>
                  Reference
                  <Input name="certification_reference" type="text" />
                </label>
                <label className={labelClass}>
                  Issued on
                  <Input name="certification_issued_on" type="date" />
                </label>
                <label className={labelClass}>
                  Expires on
                  <Input name="certification_expires_on" type="date" />
                </label>
              </div>
            </div>
          ))}
        </fieldset>

        <label className={labelClass}>
          Note to sourcing team
          <Input name="resubmitNote" type="text" placeholder="Optional" />
          <FieldDescription>Shown on the status audit trail.</FieldDescription>
        </label>

        <Button type="submit" size="lg" className="w-full">
          Resubmit for review
        </Button>
      </form>
    </div>
  )
}
