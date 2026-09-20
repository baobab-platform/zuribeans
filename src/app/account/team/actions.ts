"use server"

import { randomUUID } from "node:crypto"
import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { BuyerTradeError, inviteOrganisationMember } from "@/lib/buyer/trade-client"
import { parseBuyerInvitation } from "@/lib/validation/buyer-invitation"

export async function inviteBuyerMemberAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/team")

  const { organisation, capabilities } = await resolveBuyerAccountContext()
  if (!organisation || capabilities?.team !== true) redirect("/account")

  const invitation = parseBuyerInvitation(formData.get("email"), formData.get("role"))
  if (!invitation) redirect("/account/team?error=invalid_input")

  let outcome: "queued" | "invalid_input" | "forbidden" | "duplicate" | "failed" = "failed"
  try {
    const receipt = await inviteOrganisationMember(organisation.id, {
      ...invitation,
      idempotencyKey: `buyer-invite:${randomUUID()}`,
    })
    outcome =
      receipt.delivery_status === "QUEUED" || receipt.delivery_status === "ALREADY_REQUESTED"
        ? "queued"
        : "failed"
  } catch (error) {
    if (error instanceof BuyerTradeError) {
      if (error.code === "unauthorized") redirect("/login?next=/account/team")
      if (error.code === "invalid_input") outcome = "invalid_input"
      else if (error.code === "forbidden") outcome = "forbidden"
      else if (error.code === "duplicate") outcome = "duplicate"
    }
  }

  if (outcome !== "queued") redirect(`/account/team?error=${outcome}`)
  redirect("/account/team?invited=1")
}
