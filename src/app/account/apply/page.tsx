import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, Input, Select } from "@/components/ui/form-controls"
import { ErrorState } from "@/components/ui/state-panel"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { listBuyerOrganisationsForCustomer, BuyerTradeError } from "@/lib/buyer/trade-client"
import { submitBuyerApplicationAction, type BuyerApplicationErrorCode } from "./actions"

const errorMessages: Record<BuyerApplicationErrorCode, string> = {
  invalid_input: "Check the form for missing or invalid organisation details.",
  already_applied: "You have already submitted a buyer organisation application.",
  unauthorized: "Your session expired. Sign in again to continue.",
  failed: "We could not submit your application. Please try again.",
}

const isBuyerApplicationErrorCode = (value: string): value is BuyerApplicationErrorCode =>
  value in errorMessages

const labelClass = "block text-sm font-semibold"

export default async function BuyerApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/apply")

  let existing: Awaited<ReturnType<typeof listBuyerOrganisationsForCustomer>>
  try {
    existing = await listBuyerOrganisationsForCustomer()
  } catch (error) {
    if (error instanceof BuyerTradeError && error.code === "unauthorized") {
      redirect("/login?next=/account/apply")
    }
    return (
      <ErrorState
        title="The application service is temporarily unavailable"
        description="We could not check whether you already have a buyer organisation. Please try again later."
        action={{ href: "/account/apply", label: "Try again" }}
      />
    )
  }

  if (existing.some((row) => row.organisation))
    redirect("/account")

  const { error } = await searchParams
  const message = error && isBuyerApplicationErrorCode(error) ? errorMessages[error] : null

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Buyer onboarding</p>
      <h2 className="mt-4 font-display text-4xl text-balance sm:text-5xl">
        Apply for a trading account
      </h2>
      <p className="mt-4 max-w-2xl leading-7 text-muted">
        Submitting this application creates a buyer organisation in review. It does not approve
        trading, pricing, or orders — commercial and credit review must complete first.
      </p>
      {message ? (
        <Alert id="buyer-form-error" title="Application not submitted" tone="danger" className="mt-6">
          {message}
        </Alert>
      ) : null}
      <form
        action={submitBuyerApplicationAction}
        className="mt-10 space-y-8"
        aria-describedby={message ? "buyer-form-error" : undefined}
      >
        <fieldset className="space-y-5 rounded-panel border border-line bg-surface-raised p-6 sm:p-8">
          <legend className="font-display text-2xl">Organisation</legend>
          <label className={labelClass}>
            Legal name
            <Input
              name="legalName"
              type="text"
              required
              autoComplete="organization"
              defaultValue={customer.company_name ?? undefined}
            />
          </label>
          <label className={labelClass}>
            Trading name
            <Input name="tradingName" type="text" autoComplete="organization" />
            <FieldDescription>Optional. Shown on commercial documents when different from legal name.</FieldDescription>
          </label>
          <label className={labelClass}>
            Registration number
            <Input name="registrationNumber" type="text" autoComplete="off" />
          </label>
          <label className={labelClass}>
            Primary market
            <Select name="defaultMarketKey" defaultValue="zuribeans_za">
              <option value="zuribeans_za">South Africa (zuribeans_za)</option>
              <option value="zuribeans_ug">Uganda (zuribeans_ug)</option>
            </Select>
            <FieldDescription>Candidate market key until Control Plane publishes authoritative Market records.</FieldDescription>
          </label>
        </fieldset>

        <Button type="submit" size="lg" className="w-full">
          Submit application
        </Button>
      </form>
    </div>
  )
}
