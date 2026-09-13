import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { EmptyState, ErrorState } from "@/components/ui/state-panel"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { getSupplierApplicationForCustomer } from "@/lib/supplier/repository"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"
import { getSupplierStatusPresentation } from "@/lib/supplier/presentation"

export default async function SupplierDashboardPage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/supplier")

  let application: Awaited<ReturnType<typeof getSupplierApplicationForCustomer>>
  try {
    application = await getSupplierApplicationForCustomer(customer.id)
  } catch {
    return (
      <ErrorState
        title="The supplier workspace is temporarily unavailable"
        description="We could not load your application safely. Your submitted information has not been changed. Please try again later."
        action={{ href: "/supplier", label: "Try again" }}
      />
    )
  }

  if (!application) {
    return (
      <EmptyState
        eyebrow="Application not started"
        title="Tell us what your organisation can supply"
        description="Provide business, contact, origin, capacity and certification information for sourcing review. Submission does not guarantee qualification."
        action={{ href: "/supplier/apply", label: "Start supplier application" }}
      />
    )
  }

  const status = getSupplierStatusPresentation(application.organisation.status as SupplierStatus)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-8 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Application status</p>
            <h2 className="mt-3 font-display text-3xl">{status.label}</h2>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="mt-3 max-w-2xl leading-7 text-muted">{status.description}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Declarations remain unverified until the sourcing team completes the relevant review.
        </p>
      </Card>
      <Card className="p-8">
        <p className="eyebrow">Organisation profile</p>
        <h2 className="mt-3 font-display text-2xl">{application.organisation.legalName}</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-muted">Country</dt>
            <dd className="mt-1">{application.organisation.countryCode}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Registration number</dt>
            <dd className="mt-1">
              {application.organisation.registrationNumber || "Not supplied"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Tax identifier</dt>
            <dd className="mt-1">{application.organisation.taxIdentifier || "Not supplied"}</dd>
          </div>
        </dl>
      </Card>
      <Card className="p-8">
        <h3 className="font-display text-xl">Declared capabilities</h3>
        <ul className="mt-4 space-y-3">
          {application.capabilities.map((capability) => (
            <li key={capability.id} className="rounded-control bg-surface-muted p-4">
              <p className="font-bold capitalize">{capability.productCategory}</p>
              <p className="text-sm text-muted">
                {[capability.variety, capability.grade, capability.originCountryCode]
                  .filter(Boolean)
                  .join(" · ") || "No further detail supplied"}
              </p>
              <Badge
                tone={capability.verificationStatus === "verified" ? "success" : "warning"}
                className="mt-3"
              >
                {capability.verificationStatus === "verified" ? "Verified" : "Declared"}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
      {application.certifications.length > 0 ? (
        <Card className="p-8 lg:col-span-2">
          <h3 className="font-display text-xl">Certifications</h3>
          <ul className="mt-4 space-y-3">
            {application.certifications.map((certification) => (
              <li key={certification.id} className="rounded-control bg-surface-muted p-4">
                <p className="font-bold">{certification.certificationType}</p>
                <p className="text-sm text-muted">
                  {[certification.issuer, certification.referenceNumber]
                    .filter(Boolean)
                    .join(" · ") || "No further detail supplied"}
                </p>
                <Badge
                  tone={certification.verificationStatus === "verified" ? "success" : "warning"}
                  className="mt-3"
                >
                  {certification.verificationStatus === "verified" ? "Verified" : "Declared"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
