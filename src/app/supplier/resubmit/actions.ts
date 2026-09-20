"use server"

import { redirect } from "next/navigation"
import { getCurrentCustomer } from "@/lib/auth/customer"
import { resubmitSupplierApplication } from "@/lib/supplier/repository"
import { supplierApplicationSchema } from "@/lib/validation/supplier-application"
import { buildSupplierApplicationInput } from "@/lib/validation/supplier-application-form"

export async function resubmitSupplierApplicationAction(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/login?next=/supplier/resubmit")

  const parsed = supplierApplicationSchema.safeParse(buildSupplierApplicationInput(formData))
  if (!parsed.success) {
    redirect("/supplier/resubmit?error=invalid_input")
  }

  const note = formData.get("resubmitNote")?.toString()

  try {
    const updated = await resubmitSupplierApplication(customer.id, parsed.data, note)
    if (!updated) redirect("/supplier/resubmit?error=not_found")
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (/cannot resubmit/i.test(message)) {
      redirect("/supplier/resubmit?error=not_editable")
    }
    redirect("/supplier/resubmit?error=failed")
  }

  redirect("/supplier")
}
