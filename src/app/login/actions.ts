"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createMedusaClient } from "@/lib/medusa/client"
import { toSafeRelativePath } from "@/lib/auth/safe-redirect"
import { POST_SSO_REDIRECT_COOKIE_NAME, POST_SSO_REDIRECT_MAX_AGE_SECONDS } from "@/lib/auth/sso"
import { loginSchema } from "@/lib/validation/login"

export type LoginErrorCode = "invalid_input" | "invalid_credentials" | "sso_unavailable"

export async function loginAction(formData: FormData): Promise<void> {
  const next = toSafeRelativePath(formData.get("next")?.toString()) ?? "/account"
  const nextParam = `next=${encodeURIComponent(next)}`

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    redirect(`/login?error=invalid_input&${nextParam}`)
  }

  const sdk = createMedusaClient()

  // `redirect()` throws internally to interrupt rendering, so the success
  // path must redirect outside this try/catch — redirecting from inside
  // would be caught below and reported as a failed login.
  let succeeded = false
  try {
    const result = await sdk.auth.login("customer", "emailpass", parsed.data)
    succeeded = typeof result === "string"
  } catch {
    succeeded = false
  }

  if (!succeeded) {
    redirect(`/login?error=invalid_credentials&${nextParam}`)
  }

  redirect(next)
}

/**
 * Initiates the ZuriBeans buyer SSO flow (ADR-BCP-016 /
 * docs/governance/zuribeans-customer-oidc.md, baobab-trade's
 * `zuribeans-oidc` Auth Module provider). Authentication establishes who
 * the buyer is; it never itself grants B2B organisation membership or
 * purchasing authority -- Trade remains authoritative for that, unchanged
 * by this action.
 */
export async function loginWithSsoAction(formData: FormData): Promise<void> {
  const next = toSafeRelativePath(formData.get("next")?.toString()) ?? "/account"
  const nextParam = `next=${encodeURIComponent(next)}`

  const sdk = createMedusaClient()

  // `redirect()` throws internally to interrupt rendering (see loginAction's
  // identical note), so both success paths below redirect outside this
  // try/catch.
  let location: string | null = null
  try {
    const result = await sdk.auth.login("customer", "zuribeans-oidc", {})

    if (typeof result === "string") {
      // Already authenticated — no SSO redirect URL
      location = null
    } else if ("location" in result && typeof result.location === "string") {
      location = result.location
    } else {
      // MFA / verification (or other) — not an OIDC redirect
      location = null
    }
  } catch {
    location = null
  }

  if (!location) {
    redirect(`/login?error=sso_unavailable&${nextParam}`)
  }

  // Stashed here, not carried through the provider's own `state` parameter
  // (which baobab-trade's auth-oidc provider generates and owns for CSRF
  // protection) -- see src/lib/auth/sso.ts's doc comment.
  const store = await cookies()
  store.set(POST_SSO_REDIRECT_COOKIE_NAME, next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: POST_SSO_REDIRECT_MAX_AGE_SECONDS,
  })

  redirect(location)
}
