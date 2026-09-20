"use server"

import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import { createTaxRegistration, BuyerTradeError } from "@/lib/buyer/trade-client"

export async function addTaxRegistrationAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/company")

  const { organisation, capabilities } = await resolveBuyerAccountContext()
  if (!organisation || capabilities?.organisation !== true) {
    redirect("/account")
  }

  const marketKey = String(formData.get("marketKey") ?? "").trim()
  const countryCode = String(formData.get("countryCode") ?? "").trim()
  const registrationType = String(formData.get("registrationType") ?? "").trim()
  const registrationNumber = String(formData.get("registrationNumber") ?? "").trim()

  if (!marketKey || !countryCode || !registrationType || !registrationNumber) {
    redirect("/account/company?error=invalid_input")
  }

  let outcome: "ok" | "invalid_input" | "forbidden" | "duplicate" | "failed" = "failed"
  try {
    await createTaxRegistration(organisation.id, {
      marketKey,
      countryCode,
      registrationType,
      registrationNumber,
    })
    outcome = "ok"
  } catch (error) {
    if (error instanceof BuyerTradeError) {
      if (error.code === "unauthorized") redirect("/login?next=/account/company")
      if (error.code === "invalid_input") outcome = "invalid_input"
      else if (error.code === "forbidden") outcome = "forbidden"
      else if (error.code === "duplicate") outcome = "duplicate"
    }
  }

  if (outcome !== "ok") {
    redirect(`/account/company?error=${outcome}`)
  }

  redirect("/account/company?tax=1")
}
