import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { PATHNAME_HEADER_NAME } from "@/lib/http/constants"
import { getCurrentCustomer } from "./customer"

/**
 * Used by protected layouts (account, supplier) rather than each leaf page,
 * so the redirect target is the actual requested route (read from the
 * pathname header src/proxy.ts sets) rather than a hardcoded section root —
 * a layout that redirects to its own index loses the visitor's actual
 * destination on any nested route.
 */
export const requireCustomer = async (fallbackPath: string) => {
  const customer = await getCurrentCustomer()
  if (customer) return customer

  const headerList = await headers()
  const pathname = headerList.get(PATHNAME_HEADER_NAME) ?? fallbackPath
  const signInRoute = pathname.startsWith("/supplier")
    ? "/supplier/login"
    : pathname.startsWith("/account")
      ? "/buyer/login"
      : "/login"
  redirect(`${signInRoute}?next=${encodeURIComponent(pathname)}`)
}
