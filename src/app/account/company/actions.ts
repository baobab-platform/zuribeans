"use server"

import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { resolveBuyerAccountContext } from "@/lib/buyer/resolve-account-context"
import {
  createTaxRegistration,
  createDeliverySite,
  BuyerTradeError,
} from "@/lib/buyer/trade-client"

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

export async function addDeliverySiteAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/account/company")

  const { organisation, capabilities } = await resolveBuyerAccountContext()
  if (!organisation || capabilities?.organisation !== true) {
    redirect("/account")
  }

  const marketKey = String(formData.get("marketKey") ?? "").trim()
  const code = String(formData.get("code") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const address1 = String(formData.get("address1") ?? "").trim()
  const city = String(formData.get("city") ?? "").trim()
  const countryCode = String(formData.get("countryCode") ?? "").trim()
  const address2 = String(formData.get("address2") ?? "").trim() || undefined
  const province = String(formData.get("province") ?? "").trim() || undefined
  const postalCode = String(formData.get("postalCode") ?? "").trim() || undefined
  const contactName = String(formData.get("contactName") ?? "").trim() || undefined
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || undefined
  const allowShipping = formData.get("allowShipping") === "on"
  const allowBilling = formData.get("allowBilling") === "on"

  if (!marketKey || !code || !name || !address1 || !city || !countryCode) {
    redirect("/account/company?error=site_invalid")
  }

  let outcome: "ok" | "site_invalid" | "forbidden" | "duplicate" | "failed" = "failed"
  try {
    await createDeliverySite(organisation.id, {
      marketKey,
      code,
      name,
      address1,
      address2,
      city,
      province,
      postalCode,
      countryCode,
      contactName,
      contactPhone,
      allowShipping: allowShipping || !allowBilling,
      allowBilling,
    })
    outcome = "ok"
  } catch (error) {
    if (error instanceof BuyerTradeError) {
      if (error.code === "unauthorized") redirect("/login?next=/account/company")
      if (error.code === "invalid_input") outcome = "site_invalid"
      else if (error.code === "forbidden") outcome = "forbidden"
      else if (error.code === "duplicate") outcome = "duplicate"
    }
  }

  if (outcome !== "ok") {
    redirect(`/account/company?error=${outcome}`)
  }

  redirect("/account/company?site=1")
}
