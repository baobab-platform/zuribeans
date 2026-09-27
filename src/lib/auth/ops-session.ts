import "server-only"
import { cookies } from "next/headers"
import { timingSafeEqual } from "node:crypto"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"

const COOKIE = "zb_ops_supplier_key"

/** Interim ops gate for /ops/suppliers (ADR-0012) — same secret as admin API. */
export const isOpsAuthenticated = async (): Promise<boolean> => {
  const jar = await cookies()
  const provided = jar.get(COOKIE)?.value
  if (!provided) return false
  const { SUPPLIER_ADMIN_API_KEY } = getSupplierAdminEnvironment()
  const a = Buffer.from(provided)
  const b = Buffer.from(SUPPLIER_ADMIN_API_KEY)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export const setOpsSessionCookie = async (apiKey: string): Promise<void> => {
  const jar = await cookies()
  jar.set(COOKIE, apiKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/ops",
    maxAge: 60 * 60 * 8,
  })
}

export const clearOpsSessionCookie = async (): Promise<void> => {
  const jar = await cookies()
  jar.delete(COOKIE)
}
