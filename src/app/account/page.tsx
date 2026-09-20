import Link from "next/link"
import { BuyerCapabilityBoundary } from "@/components/buyer/capability-boundary"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { listBuyerOrganisationsForCustomer, BuyerTradeError } from "@/lib/buyer/trade-client"
import type { BuyerOrganisationStatus } from "@/lib/buyer/types"

const statusCopy = (status: BuyerOrganisationStatus | null): { title: string; body: string } => {
  switch (status) {
    case "PENDING":
      return {
        title: "Organisation under review",
        body: "Your buyer organisation application is awaiting verification, commercial review, and credit review. Trading features stay restricted until activation.",
      }
    case "ACTIVE":
      return {
        title: "Organisation active",
        body: "Your buyer organisation is active. Commercial workspace sections still open only when Trade confirms each capability.",
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
        body: "A login is not a trading account. Apply for a buyer organisation so ZuriBeans can run KYB, commercial, and credit review.",
      }
  }
}

export default async function AccountDashboardPage() {
  let orgStatus: BuyerOrganisationStatus | null = null
  let legalName: string | null = null
  let loadFailed = false

  try {
    const rows = await listBuyerOrganisationsForCustomer()
    const first = rows.find((row) => row.organisation)?.organisation
    if (first) {
      orgStatus = first.status
      legalName = first.legal_name
    }
  } catch (error) {
    if (!(error instanceof BuyerTradeError && error.code === "unauthorized")) {
      loadFailed = true
    }
  }

  const copy = statusCopy(orgStatus)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <Card className="p-8">
        <p className="eyebrow">Account status</p>
        <h2 className="mt-4 font-display text-3xl">{copy.title}</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">{copy.body}</p>
        {legalName ? (
          <p className="mt-3 text-sm font-semibold">Organisation: {legalName}</p>
        ) : null}
        {loadFailed ? (
          <p className="mt-3 text-sm text-muted">
            Organisation status could not be refreshed from Trade. Your login remains valid.
          </p>
        ) : null}
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Identity active"],
            [
              "2",
              orgStatus === "ACTIVE"
                ? "Organisation active"
                : orgStatus === "PENDING"
                  ? "Organisation in review"
                  : "Organisation required",
            ],
            [
              "3",
              orgStatus === "ACTIVE" ? "Capabilities gated by Trade" : "Trading features restricted",
            ],
          ].map(([number, label]) => (
            <div key={number} className="rounded-control bg-surface-muted p-4">
              <p className="font-display text-2xl text-clay">{number}</p>
              <p className="mt-2 text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
        {!orgStatus ? (
          <ButtonLink href="/account/apply" className="mt-8">
            Apply for a trading account
          </ButtonLink>
        ) : null}
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
        {orgStatus === "PENDING" ? (
          <p className="mt-6 text-sm leading-6 text-muted">
            Need to update details? Contact support — re-apply is blocked while a membership exists.
          </p>
        ) : null}
        {orgStatus ? (
          <p className="mt-4 text-sm">
            <Link href="/account/apply" className="font-semibold underline-offset-4 hover:underline">
              Application entry
            </Link>{" "}
            redirects here once an organisation exists.
          </p>
        ) : null}
      </Card>
      <BuyerCapabilityBoundary capabilities={null} />
    </div>
  )
}
