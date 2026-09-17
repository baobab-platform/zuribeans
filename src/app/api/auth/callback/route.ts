// Gate ZB-03.4 (ZuriBeans BFF authentication): the callback Route Handler
// baobab-trade's `zuribeans-oidc` Auth Module provider redirects to by
// default (BAOBAB_IAM_ZURIBEANS_OIDC_CALLBACK_URL, defaulting to
// "http://localhost:3000/api/auth/callback" -- baobab-trade/src/baobab/auth/
// providers.ts). It forwards the OIDC authorization code/state to Trade's
// `/auth/customer/zuribeans-oidc/callback` (via the js-sdk's auth.callback),
// which validates them against Baobab IAM and returns a Medusa customer JWT
// that createMedusaClient's cookieAuthStorage then persists -- the same
// httpOnly `zb_session` cookie loginAction's emailpass path already writes.
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createMedusaClient } from "@/lib/medusa/client"
import { toSafeRelativePath } from "@/lib/auth/safe-redirect"
import { POST_SSO_REDIRECT_COOKIE_NAME } from "@/lib/auth/sso"

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const store = await cookies()
  const next = toSafeRelativePath(store.get(POST_SSO_REDIRECT_COOKIE_NAME)?.value) ?? "/account"
  store.delete(POST_SSO_REDIRECT_COOKIE_NAME)

  const query = Object.fromEntries(url.searchParams)
  const sdk = createMedusaClient()

  try {
    const token = await sdk.auth.callback("customer", "zuribeans-oidc", query)
    if (!token) {
      throw new Error("empty callback token")
    }
  } catch {
    const errorNext = `next=${encodeURIComponent(next)}`
    return NextResponse.redirect(new URL(`/login?error=sso_unavailable&${errorNext}`, url))
  }

  return NextResponse.redirect(new URL(next, url))
}
