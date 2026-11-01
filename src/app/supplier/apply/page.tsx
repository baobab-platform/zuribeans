import { redirect } from "next/navigation"
import { ErrorState } from "@/components/ui/state-panel"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { getSupplierApplicationForCustomer } from "@/lib/supplier/repository"
import { SupplierApplicationJourney } from "@/components/supplier/supplier-application-journey"
import { SupplierApplicationHeader } from "@/components/supplier/supplier-application-header"
import { supplierApplicationSections } from "@/components/supplier/supplier-application-sections"
import { submitSupplierApplicationAction, type SupplierApplicationErrorCode } from "./actions"

const errorMessages: Record<SupplierApplicationErrorCode, string> = {
  invalid_input: "Check the form for missing or invalid fields — at least one product is required.",
  already_applied: "You have already submitted a supplier application.",
  failed: "We could not submit your application. Please try again.",
}
const isErrorCode = (value: string): value is SupplierApplicationErrorCode => value in errorMessages

export default async function SupplierApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/supplier/login?next=/supplier/apply")

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
  const message = error && isErrorCode(error) ? errorMessages[error] : null
  return (
    <SupplierApplicationJourney
      heading={<SupplierApplicationHeader mode="apply" />}
      mode="apply"
      action={submitSupplierApplicationAction}
      sections={supplierApplicationSections()}
      error={message}
    />
  )
}
