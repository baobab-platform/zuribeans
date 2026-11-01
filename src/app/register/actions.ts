"use server"

import { redirect } from "next/navigation"
import { FetchError } from "@medusajs/js-sdk"
import { createMedusaClient } from "@/lib/medusa/client"
import { toSafeRelativePath } from "@/lib/auth/safe-redirect"
import { registerSchema } from "@/lib/validation/register"

export type RegisterErrorCode = "invalid_input" | "email_taken" | "failed"

const isDuplicateIdentityError = (error: unknown): boolean =>
  error instanceof FetchError && error.status === 422

export async function registerAction(formData: FormData): Promise<void> {
  const next = toSafeRelativePath(formData.get("next")?.toString()) ?? "/account"
  const journey = formData.get("journey") === "supplier" ? "supplier" : formData.get("journey") === "buyer" ? "buyer" : null
  const errorRoute = journey ? `/${journey}/register` : "/register"
  const nextParam = `next=${encodeURIComponent(next)}`

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    companyName: formData.get("companyName"),
  })

  if (!parsed.success) {
    redirect(`${errorRoute}?error=invalid_input&${nextParam}`)
  }

  const { email, password, firstName, lastName, companyName } = parsed.data
  const sdk = createMedusaClient()

  // See src/app/login/actions.ts for why the redirect happens outside this
  // try/catch rather than on the happy path within it.
  let outcome: "ok" | "email_taken" | "failed" = "failed"
  try {
    const registrationToken = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })
    await sdk.store.customer.create(
      { email, first_name: firstName, last_name: lastName, company_name: companyName },
      {},
      { Authorization: `Bearer ${registrationToken}` },
    )
    const loginResult = await sdk.auth.login("customer", "emailpass", { email, password })
    outcome = typeof loginResult === "string" ? "ok" : "failed"
  } catch (error) {
    outcome = isDuplicateIdentityError(error) ? "email_taken" : "failed"
  }

  if (outcome !== "ok") {
    redirect(`${errorRoute}?error=${outcome}&${nextParam}`)
  }

  redirect(next)
}
