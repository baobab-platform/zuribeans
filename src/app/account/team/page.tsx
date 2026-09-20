import Link from "next/link"
import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/form-controls"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { listOrganisationMembers, BuyerTradeError } from "@/lib/buyer/trade-client"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { inviteTeamMemberAction } from "./actions"

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

const errorMessages: Record<string, string> = {
  invalid_input: "Enter a valid email address.",
  forbidden: "Only an account admin can invite members.",
  duplicate: "That email is already invited to this organisation.",
  failed: "The invitation could not be sent. Try again.",
}

export default async function BuyerTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invited?: string; token?: string }>
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

  const caller = members.find((m) => m.customer_id === customer.id)
  const canInvite = caller?.roles.includes("ACCOUNT_ADMIN") === true

  const { error, invited, token } = await searchParams
  const errorMessage = error ? errorMessages[error] : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Team</p>
        <h2 className="mt-3 font-display text-3xl">Members</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Roster for {organisation.legal_name}. Share the accept link until email delivery is wired.
        </p>
      </div>

      {invited ? (
        <Alert title="Invitation created" tone="success">
          {token ? (
            <>
              Share this accept link with the invitee:{" "}
              <Link
                className="font-semibold underline-offset-2 hover:underline"
                href={`/account/invitations/accept?token=${encodeURIComponent(token)}`}
              >
                Accept invitation
              </Link>
              . Token is shown once; email delivery is not enabled yet.
            </>
          ) : (
            "Member listed as INVITED."
          )}
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert title="Invitation not sent" tone="danger">
          {errorMessage}
        </Alert>
      ) : null}

      {canInvite ? (
        <Card className="p-6">
          <h3 className="font-display text-xl">Invite a member</h3>
          <form
            action={inviteTeamMemberAction}
            className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end"
          >
            <label className="block text-sm font-semibold">
              Email
              <Input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="block text-sm font-semibold">
              Role
              <Select name="role" defaultValue="BUYER">
                <option value="BUYER">Buyer</option>
                <option value="SENIOR_BUYER">Senior buyer</option>
                <option value="APPROVER">Approver</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </label>
            <Button type="submit">Invite</Button>
          </form>
        </Card>
      ) : (
        <Card className="p-6">
          <p className="text-sm text-muted">
            Only account admins can invite members.{" "}
            <Link href="/account/invitations/accept" className="font-semibold underline-offset-2 hover:underline">
              Accept an invitation
            </Link>
            .
          </p>
        </Card>
      )}

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
