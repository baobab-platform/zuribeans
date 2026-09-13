import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, Input, Select } from "@/components/ui/form-controls"
import { ErrorState } from "@/components/ui/state-panel"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { getSupplierApplicationForCustomer } from "@/lib/supplier/repository"
import { SUPPLIER_CAPABILITY_CATEGORIES } from "@/lib/supplier/categories"
import { submitSupplierApplicationAction, type SupplierApplicationErrorCode } from "./actions"

const errorMessages: Record<SupplierApplicationErrorCode, string> = {
  invalid_input: "Check the form for missing or invalid fields — at least one product is required.",
  already_applied: "You have already submitted a supplier application.",
  failed: "We could not submit your application. Please try again.",
}

const isSupplierApplicationErrorCode = (value: string): value is SupplierApplicationErrorCode =>
  value in errorMessages

const CAPABILITY_SLOTS = [0, 1, 2]
const CERTIFICATION_SLOTS = [0, 1, 2]

const labelClass = "block text-sm font-semibold"

export default async function SupplierApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/supplier/apply")

  let existing: Awaited<ReturnType<typeof getSupplierApplicationForCustomer>>
  try {
    existing = await getSupplierApplicationForCustomer(customer.id)
  } catch {
    return (
      <ErrorState
        title="The application service is temporarily unavailable"
        description="We could not safely check your application status. Please try again later; do not submit the form again until this page loads normally."
        action={{ href: "/supplier/apply", label: "Try again" }}
      />
    )
  }
  if (existing) redirect("/supplier")

  const { error } = await searchParams
  const message = error && isSupplierApplicationErrorCode(error) ? errorMessages[error] : null

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Sourcing application</p>
      <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl">
        Tell us about your supply capability
      </h2>
      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Submitting this application does not itself approve you to supply ZuriBeans — our sourcing
        team reviews every application, and declared capabilities are shown as declared until
        verified.
      </p>
      {message ? (
        <Alert
          id="supplier-form-error"
          title="Application not submitted"
          tone="danger"
          className="mt-6"
        >
          {message}
        </Alert>
      ) : null}
      <form
        action={submitSupplierApplicationAction}
        className="mt-10 space-y-8"
        aria-describedby={message ? "supplier-form-error" : undefined}
      >
        <fieldset className="space-y-5 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Organisation</legend>
          <label className={labelClass}>
            Legal name
            <Input name="legalName" type="text" required autoComplete="organization" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Registration number
              <Input name="registrationNumber" type="text" autoComplete="off" />
            </label>
            <label className={labelClass}>
              Tax identifier
              <Input name="taxIdentifier" type="text" autoComplete="off" />
            </label>
          </div>
          <label className={labelClass}>
            Country
            <Input
              name="countryCode"
              type="text"
              required
              maxLength={2}
              pattern="[A-Za-z]{2}"
              placeholder="e.g. UG"
              autoComplete="off"
              className="uppercase"
            />
            <FieldDescription>
              Use the ISO two-letter code for the organisation&apos;s country.
            </FieldDescription>
          </label>
        </fieldset>

        <fieldset className="space-y-5 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Primary contact</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <Input name="contactName" type="text" required autoComplete="name" />
            </label>
            <label className={labelClass}>
              Role
              <Input
                name="contactRole"
                type="text"
                required
                placeholder="e.g. Sales, Operations"
                autoComplete="organization-title"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Email
              <Input name="contactEmail" type="email" required autoComplete="email" />
            </label>
            <label className={labelClass}>
              Phone
              <Input name="contactPhone" type="tel" autoComplete="tel" />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-6 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">What can you supply?</legend>
          <p className="text-sm text-muted">
            At least one product is required; the other slots are optional.
          </p>
          {CAPABILITY_SLOTS.map((slot) => (
            <div key={slot} className="rounded-control border border-line bg-surface p-5">
              <p className="font-bold">
                {slot === 0 ? "Product 1 (required)" : `Product ${slot + 1} (optional)`}
              </p>
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
                    pattern="[A-Za-z]{2}"
                    placeholder="e.g. UG"
                    className="uppercase"
                  />
                </label>
                <label className={labelClass}>
                  Indicative capacity
                  <Input name="capability_capacity" type="text" placeholder="e.g. 50 tonnes/year" />
                </label>
                <label className={labelClass}>
                  Season
                  <Input name="capability_season" type="text" placeholder="e.g. October-February" />
                </label>
                <label className={labelClass}>
                  Lead time (days)
                  <Input
                    name="capability_lead_time_days"
                    type="number"
                    min={0}
                    inputMode="numeric"
                  />
                </label>
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset className="space-y-6 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Certifications (optional)</legend>
          <Alert title="Document upload is not available yet" tone="info">
            Declare certification details here. A secure supporting-document service has not been
            integrated, so this form will not ask you to upload files or send sensitive documents.
          </Alert>
          {CERTIFICATION_SLOTS.map((slot) => (
            <div key={slot} className="rounded-control border border-line bg-surface p-5">
              <p className="font-bold">Certification {slot + 1}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Type
                  <Input
                    name="certification_type"
                    type="text"
                    placeholder="e.g. Organic, Fair Trade"
                  />
                </label>
                <label className={labelClass}>
                  Issuer
                  <Input name="certification_issuer" type="text" />
                </label>
                <label className={labelClass}>
                  Reference number
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

        <Button type="submit" size="lg" className="w-full">
          Submit application
        </Button>
      </form>
    </div>
  )
}
