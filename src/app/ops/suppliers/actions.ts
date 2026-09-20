"use server"

import { redirect } from "next/navigation"
import { timingSafeEqual } from "node:crypto"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"
import {
  addSupplierDocumentReference,
  setErpProjectionStatus,
  transitionSupplierStatus,
} from "@/lib/supplier/repository"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"
import { clearOpsSessionCookie, isOpsAuthenticated, setOpsSessionCookie } from "@/lib/auth/ops-session"

export async function opsLoginAction(formData: FormData): Promise<void> {
  const key = formData.get("apiKey")?.toString() ?? ""
  const { SUPPLIER_ADMIN_API_KEY } = getSupplierAdminEnvironment()
  const a = Buffer.from(key)
  const b = Buffer.from(SUPPLIER_ADMIN_API_KEY)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    redirect("/ops/suppliers?error=unauthorized")
  }
  await setOpsSessionCookie(key)
  redirect("/ops/suppliers")
}

export async function opsLogoutAction(): Promise<void> {
  await clearOpsSessionCookie()
  redirect("/ops/suppliers")
}

export async function opsTransitionAction(formData: FormData): Promise<void> {
  if (!(await isOpsAuthenticated())) redirect("/ops/suppliers?error=unauthorized")

  const id = formData.get("id")?.toString()
  const status = formData.get("status")?.toString() as SupplierStatus | undefined
  const actor = formData.get("actor")?.toString() || "ops"
  const reason = formData.get("reason")?.toString()

  if (!id || !status) redirect("/ops/suppliers?error=invalid")

  try {
    await transitionSupplierStatus({
      supplierOrganisationId: id,
      toStatus: status,
      actor: `staff:${actor}`,
      reason,
    })
  } catch {
    redirect(`/ops/suppliers/${id}?error=transition`)
  }
  redirect(`/ops/suppliers/${id}`)
}

export async function opsDocumentRefAction(formData: FormData): Promise<void> {
  if (!(await isOpsAuthenticated())) redirect("/ops/suppliers?error=unauthorized")

  const id = formData.get("id")?.toString()
  const kind = formData.get("kind")?.toString()
  const label = formData.get("label")?.toString()
  const externalReference = formData.get("externalReference")?.toString()
  const actor = formData.get("actor")?.toString() || "ops"

  if (!id || !kind || !label) redirect(`/ops/suppliers/${id}?error=invalid`)

  await addSupplierDocumentReference({
    supplierOrganisationId: id,
    kind,
    label,
    externalReference,
    recordedBy: `staff:${actor}`,
  })
  redirect(`/ops/suppliers/${id}`)
}

export async function opsErpReadyAction(formData: FormData): Promise<void> {
  if (!(await isOpsAuthenticated())) redirect("/ops/suppliers?error=unauthorized")

  const id = formData.get("id")?.toString()
  const actor = formData.get("actor")?.toString() || "ops"
  if (!id) redirect("/ops/suppliers?error=invalid")

  try {
    await setErpProjectionStatus({
      supplierOrganisationId: id,
      status: "READY",
      actor: `staff:${actor}`,
    })
  } catch {
    redirect(`/ops/suppliers/${id}?error=erp`)
  }
  redirect(`/ops/suppliers/${id}`)
}
