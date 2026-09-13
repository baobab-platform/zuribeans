import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, Input } from "@/components/ui/form-controls"
import { toSafeRelativePath } from "@/lib/auth/safe-redirect"
import { registerAction, type RegisterErrorCode } from "./actions"

export const metadata: Metadata = {
  title: "Create a trade login",
  robots: { index: false, follow: false },
}

const errorMessages: Record<RegisterErrorCode, string> = {
  invalid_input: "Check the form for missing or invalid fields.",
  email_taken: "An account with this email already exists. Try signing in instead.",
  failed: "We could not create your account. Please try again.",
}

const isRegisterErrorCode = (value: string): value is RegisterErrorCode => value in errorMessages

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next: rawNext } = await searchParams
  const message = error && isRegisterErrorCode(error) ? errorMessages[error] : null
  const next = toSafeRelativePath(rawNext) ?? "/account"

  return (
    <AuthShell
      eyebrow="Trade account"
      title="Create a ZuriBeans login"
      description="Create a personal sign-in for buyer and supplier journeys. This does not approve an organisation for trading or sourcing."
    >
      {message ? (
        <Alert tone="danger" title="We could not create the account.">
          {message}
        </Alert>
      ) : null}
      <form action={registerAction} className="mt-2 space-y-5">
        <input type="hidden" name="next" value={next} />
        <label className="block font-semibold">
          Company name
          <Input name="companyName" type="text" required autoComplete="organization" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block font-semibold">
            First name
            <Input name="firstName" type="text" required autoComplete="given-name" />
          </label>
          <label className="block font-semibold">
            Last name
            <Input name="lastName" type="text" required autoComplete="family-name" />
          </label>
        </div>
        <label className="block font-semibold">
          Business email
          <Input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="block font-semibold">
          Password
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-describedby="password-requirements"
          />
          <FieldDescription id="password-requirements">
            Use at least eight characters.
          </FieldDescription>
        </label>
        <label className="block font-semibold">
          Confirm password
          <Input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have a login?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-ink underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
