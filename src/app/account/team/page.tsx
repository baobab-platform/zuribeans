import Link from "next/link"
import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldDescription, Input, Select } from "@/components/ui/form-controls"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { listOrganisationMembers, BuyerTradeError } from "@/lib/buyer/trade-client"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { BUYER_INVITE_ROLES } from "@/lib/validation/buyer-invitation"
import { inviteBuyerMemberAction } from "./actions"

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

const invitationErrors: Record<string, string> = {
  invalid_input: "Enter a valid email address and choose a permitted buyer role.",
  forbidden: "Only an active account admin with a canonical Principal can invite members.",
  duplicate: "That email already has a membership or pending invitation.",
  failed: "The invitation could not be queued. Try again or contact support.",
}

export default async function BuyerTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invited?: string }>
}) {
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
  const { error, invited } = await searchParams
  const invitationError = error ? invitationErrors[error] : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Team</p>
        <h2 className="mt-3 font-display text-3xl">Members</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Roster for {organisation.legal_name}.
        </p>
      </div>

      {invited === "1" ? (
        <Alert title="Invitation queued" tone="success">
          Trade queued a one-time invitation for email delivery. No bearer token is displayed here.
        </Alert>
      ) : null}
      {invitationError ? (
        <Alert title="Could not invite member" tone="danger">
          {invitationError}
        </Alert>
      ) : null}

      <Card className="p-6">
        <h3 className="font-display text-xl">Invite a member</h3>
        {canInvite ? (
          <form action={inviteBuyerMemberAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold sm:col-span-2">
              Email address
              <Input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="block text-sm font-semibold">
              Organisation role
              <Select name="role" defaultValue="BUYER" required>
                {BUYER_INVITE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Send secure invitation
              </Button>
            </div>
            <FieldDescription id="invitation-delivery" >
              The invitation is delivered by Trade using a one-time token that expires after 48
              hours. ZuriBeans never displays or stores the token.
            </FieldDescription>
          </form>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            Only account admins can invite members.
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-muted">
          Already received an invitation?{" "}
          <Link
            href="/account/invitations/accept"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Accept it here
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
