"use server"

import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { applyForBuyerOrganisation, BuyerTradeError } from "@/lib/buyer/trade-client"
import { buyerApplicationSchema } from "@/lib/validation/buyer-application"

export type BuyerApplicationErrorCode =
  | "invalid_input"
  | "already_applied"
  | "unauthorized"
  | "failed"

export async function submitBuyerApplicationAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/apply")

  const parsed = buyerApplicationSchema.safeParse({
    legalName: formData.get("legalName"),
    tradingName: formData.get("tradingName") || undefined,
    registrationNumber: formData.get("registrationNumber") || undefined,
    defaultMarketKey: formData.get("defaultMarketKey") || undefined,
  })

  if (!parsed.success) {
    redirect("/account/apply?error=invalid_input")
  }

  let outcome: "ok" | BuyerApplicationErrorCode = "failed"
  try {
    await applyForBuyerOrganisation(parsed.data)
    outcome = "ok"
  } catch (error) {
    if (error instanceof BuyerTradeError) {
      outcome = error.code
    }
  }

  if (outcome !== "ok") {
    redirect(`/account/apply?error=${outcome}`)
  }

  redirect("/account")
}
