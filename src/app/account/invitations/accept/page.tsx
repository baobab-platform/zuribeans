import { redirect } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldDescription, Input } from "@/components/ui/form-controls"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { acceptInvitationAction } from "./actions"

const errorMessages: Record<string, string> = {
  invalid_input: "Provide a valid invitation token.",
  not_found: "This invitation is invalid or already used.",
  forbidden: "You cannot accept this invitation (you may already belong to an organisation).",
  failed: "Acceptance failed. Try again.",
}

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; token?: string }>
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/invitations/accept")

  const { error, token } = await searchParams
  const message = error ? errorMessages[error] : null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="eyebrow">Team invitation</p>
        <h2 className="mt-3 font-display text-3xl">Accept invitation</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Sign in as the invited email, then submit the invitation token you received from your
          organisation admin.
        </p>
      </div>
      {message ? (
        <Alert title="Could not accept invitation" tone="danger">
          {message}
        </Alert>
      ) : null}
      <Card className="p-6">
        <form action={acceptInvitationAction} className="space-y-4">
          <label className="block text-sm font-semibold">
            Invitation token
            <Input
              name="invitationToken"
              type="text"
              required
              defaultValue={token ?? undefined}
              autoComplete="off"
            />
            <FieldDescription>
              Tokens expire after 14 days and can only be used once.
            </FieldDescription>
          </label>
          <Button type="submit" className="w-full">
            Accept and join organisation
          </Button>
        </form>
      </Card>
    </div>
  )
}
