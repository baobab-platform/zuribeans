"use server"

import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { inviteOrganisationMember, BuyerTradeError } from "@/lib/buyer/trade-client"

export async function inviteTeamMemberAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/team")

  const { organisation, capabilities } = await resolveBuyerAccountContext()
  if (!organisation || capabilities?.team !== true) {
    redirect("/account")
  }

  const email = String(formData.get("email") ?? "").trim()
  const role = String(formData.get("role") ?? "BUYER").trim() || "BUYER"

  if (!email) {
    redirect("/account/team?error=invalid_input")
  }

  let outcome: "ok" | "invalid_input" | "forbidden" | "duplicate" | "failed" = "failed"
  try {
    await inviteOrganisationMember(organisation.id, { email, role })
    outcome = "ok"
  } catch (error) {
    if (error instanceof BuyerTradeError) {
      if (error.code === "unauthorized") redirect("/login?next=/account/team")
      if (error.code === "invalid_input") outcome = "invalid_input"
      else if (error.code === "forbidden") outcome = "forbidden"
      else if (error.code === "duplicate") outcome = "duplicate"
    }
  }

  if (outcome !== "ok") {
    redirect(`/account/team?error=${outcome}`)
  }

  redirect("/account/team?invited=1")
}
