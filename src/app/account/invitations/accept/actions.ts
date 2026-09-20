"use server"

import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { acceptInvitation, BuyerTradeError } from "@/lib/buyer/trade-client"

export async function acceptInvitationAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/invitations/accept")

  const token = String(formData.get("invitationToken") ?? "").trim()
  if (!token) {
    redirect("/account/invitations/accept?error=invalid_input")
  }

  let outcome: "ok" | "invalid_input" | "not_found" | "forbidden" | "failed" = "failed"
  try {
    await acceptInvitation(token)
    outcome = "ok"
  } catch (error) {
    if (error instanceof BuyerTradeError) {
      if (error.code === "unauthorized") {
        redirect("/login?next=/account/invitations/accept")
      }
      if (error.code === "invalid_input") outcome = "invalid_input"
      else if (error.code === "not_found") outcome = "not_found"
      else if (error.code === "forbidden") outcome = "forbidden"
    }
  }

  if (outcome !== "ok") {
    redirect(`/account/invitations/accept?error=${outcome}`)
  }

  redirect("/account")
}
