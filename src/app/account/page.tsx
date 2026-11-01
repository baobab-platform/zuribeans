import { BuyerWorkspaceModules } from "@/components/buyer/workspace-modules"
import { BuyerCapabilityBoundary } from "@/components/buyer/capability-boundary"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import type { BuyerApplicationStatus, BuyerOrganisationStatus } from "@/lib/buyer/types"

const statusCopy = (status: BuyerOrganisationStatus | null): { title: string; body: string } => {
  switch (status) {
    case "PENDING":
      return {
        title: "Organisation under review",
        body: "We are reviewing your business application. Purchasing services remain unavailable until approval.",
      }
    case "ACTIVE":
      return {
        title: "Organisation active",
        body: "Your organisation is active. The services available to you depend on your approved permissions.",
      }
    case "SUSPENDED":
      return {
        title: "Organisation suspended",
        body: "This buyer organisation cannot trade until suspension is lifted.",
      }
    case "CLOSED":
      return {
        title: "Organisation closed",
        body: "This buyer organisation is closed and cannot be used for new trading activity.",
      }
    default:
      return {
        title: "No buyer organisation yet",
        body: "Apply to register your business before accessing purchasing services.",
      }
  }
}

const applicationCopy = (status: BuyerApplicationStatus): { title: string; body: string } => {
  switch (status) {
    case "INFORMATION_REQUIRED":
      return {
        title: "More information required",
        body: "ZuriBeans needs additional organisation evidence before review can continue.",
      }
    case "UNDER_REVIEW":
      return {
        title: "Application under review",
        body: "We are reviewing your business details. Purchasing is not available yet.",
      }
    case "REJECTED":
      return {
        title: "Application not approved",
        body: "The buyer application was not approved. Contact support if you need the decision reviewed.",
      }
    case "WITHDRAWN":
      return {
        title: "Application withdrawn",
        body: "This application is no longer under review.",
      }
    default:
      return {
        title: "Application submitted",
        body: "We have received your application. You will need approval before purchasing.",
      }
  }
}

export default async function AccountDashboardPage() {
  const { application, organisation, capabilities, loadFailed } = await resolveBuyerAccountContext()
  const orgStatus = organisation?.status ?? null
  const copy = organisation
    ? statusCopy(orgStatus)
    : application
      ? applicationCopy(application.status)
      : statusCopy(null)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <Card className="p-8">
        <p className="eyebrow">Account status</p>
        <h2 className="mt-4 font-display text-3xl">{copy.title}</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">{copy.body}</p>
        {organisation ? (
          <p className="mt-3 text-sm font-semibold">Organisation: {organisation.legal_name}</p>
        ) : application ? (
          <p className="mt-3 text-sm font-semibold">Application: {application.legal_name}</p>
        ) : null}
        {loadFailed ? (
          <p className="mt-3 text-sm text-muted">
            We could not refresh your organisation status. Please try again later.
          </p>
        ) : null}
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Identity active"],
            [
              "2",
              orgStatus === "ACTIVE"
                ? "Organisation active"
                : application
                  ? "Application in review"
                  : "Application required",
            ],
            [
              "3",
              capabilities?.organisation
                ? "Company workspace available"
                : "Trading features restricted",
            ],
          ].map(([number, label]) => (
            <div key={number} className="rounded-control bg-surface-muted p-4">
              <p className="font-display text-2xl text-clay">{number}</p>
              <p className="mt-2 text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
        {!orgStatus && !application ? (
          <ButtonLink href="/account/apply" className="mt-8">
            Apply for a trading account
          </ButtonLink>
        ) : null}
        {capabilities?.organisation ? (
          <ButtonLink href="/account/company" variant="outline" className="mt-8">
            View company profile
          </ButtonLink>
        ) : null}
      </Card>
      <Card className="p-8">
        <p className="eyebrow">While access is reviewed</p>
        <h2 className="mt-4 font-display text-2xl">Explore public product information.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Browse products while your application is reviewed. Contact us to confirm availability
          and commercial terms.
        </p>
        <ButtonLink href="/products" variant="outline" className="mt-6">
          Browse products
        </ButtonLink>
      </Card>
      <BuyerCapabilityBoundary capabilities={capabilities} />
      <div className="lg:col-span-2">
        <BuyerWorkspaceModules />
      </div>
    </div>
  )
}
