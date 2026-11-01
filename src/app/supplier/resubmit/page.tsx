import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { ErrorState } from "@/components/ui/state-panel"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { getSupplierApplicationForCustomer } from "@/lib/supplier/repository"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"
import { SupplierApplicationJourney } from "@/components/supplier/supplier-application-journey"
import { supplierApplicationSections } from "@/components/supplier/supplier-application-sections"
import { resubmitSupplierApplicationAction } from "./actions"

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
      <ErrorState title="Unable to load application" description="Please try again shortly."
        action={{ href: "/supplier/resubmit", label: "Try again" }} />
    )
  }
  if (!application) redirect("/supplier/apply")
  if (!EDITABLE.includes(application.organisation.status as SupplierStatus)) redirect("/supplier")

  const { error } = await searchParams
  const org = application.organisation
  const contact = application.contacts[0]
  const sections = supplierApplicationSections({
    legalName: org.legalName,
    registrationNumber: org.registrationNumber ?? "",
    taxIdentifier: org.taxIdentifier ?? "",
    countryCode: org.countryCode,
    contactName: contact?.name ?? "",
    contactRole: contact?.role ?? "",
    contactEmail: contact?.email ?? "",
    contactPhone: contact?.phone ?? "",
    capabilities: application.capabilities.map(c => ({
      category: c.productCategory,
      variety: c.variety,
      grade: c.grade,
      originCountryCode: c.originCountryCode,
      capacityDescription: c.capacityDescription,
      season: c.season,
      leadTimeDays: c.leadTimeDays,
    })),
    certifications: application.certifications.map(c => ({
      certificationType: c.certificationType,
      issuer: c.issuer,
      referenceNumber: c.referenceNumber,
      issuedOn: c.issuedOn,
      expiresOn: c.expiresOn,
    })),
  })

  return (
    <>
      {error ? (
        <Alert title="Could not resubmit" tone="danger" className="mx-auto mb-6 max-w-3xl">
          {error === "invalid_input"
            ? "Check required fields and at least one product capability."
            : error === "not_editable"
              ? "This application is no longer open for applicant edits."
              : "Please try again."}
        </Alert>
      ) : null}
      <SupplierApplicationJourney
        mode="resubmit"
        action={resubmitSupplierApplicationAction}
        sections={sections}
      />
    </>
  )
}
