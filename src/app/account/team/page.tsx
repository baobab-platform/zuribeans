import Link from "next/link"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { listOrganisationMembers, BuyerTradeError } from "@/lib/buyer/trade-client"
import { getCurrentCustomer } from "@/lib/auth/customer"

const membershipTone = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success" as const
    case "INVITED":
      return "info" as const
    case "SUSPENDED":
    case "REVOKED":
      return "danger" as const
    default:
      return "neutral" as const
  }
}

export default async function BuyerTeamPage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/team")

  const { organisation, capabilities } = await resolveBuyerAccountContext()

  if (capabilities?.team !== true || !organisation) {
    redirect("/account")
  }

  let members: Awaited<ReturnType<typeof listOrganisationMembers>> = []
  let loadFailed = false
  try {
    members = await listOrganisationMembers(organisation.id)
  } catch (error) {
    if (error instanceof BuyerTradeError && error.code === "unauthorized") {
      redirect("/login?next=/account/team")
    }
    loadFailed = true
  }

  const caller = members.find((member) => member.customer_id === customer.id)
  const canInvite = caller?.roles.includes("ACCOUNT_ADMIN") === true

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Team</p>
        <h2 className="mt-3 font-display text-3xl">Members</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Roster for {organisation.legal_name}.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-display text-xl">Invite a member</h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          {canInvite
            ? "Invitations are temporarily unavailable while secure email delivery and one-time token handling are completed."
            : "Only account admins can invite members."}{" "}
          If you already received an invitation through an approved channel,{" "}
          <Link
            href="/account/invitations/accept"
            className="font-semibold underline-offset-2 hover:underline"
          >
            accept it here
          </Link>
          .
        </p>
      </Card>

      {loadFailed ? (
        <Card className="p-6">
          <p className="text-sm text-muted">Team members could not be loaded from Trade.</p>
        </Card>
      ) : members.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted">No members returned for this organisation.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id}>
              <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{member.invited_email || member.customer_id}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{member.id}</p>
                  {member.roles.length > 0 ? (
                    <p className="mt-2 text-sm text-muted">{member.roles.join(", ")}</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">No roles assigned</p>
                  )}
                </div>
                <Badge tone={membershipTone(member.status)}>{member.status}</Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
