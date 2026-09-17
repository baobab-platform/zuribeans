import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/form-controls"
import { toSafeRelativePath } from "@/lib/auth/safe-redirect"
import { loginSchema } from "@/lib/validation/login"
import { loginAction, loginWithSsoAction, type LoginErrorCode } from "./actions"

export const metadata: Metadata = {
  title: "Buyer login",
  robots: { index: false, follow: false },
}

const errorMessages: Record<LoginErrorCode, string> = {
  invalid_input: "Enter a valid business email and password.",
  invalid_credentials: "That email and password combination is not recognised.",
  sso_unavailable: "ZuriBeans SSO is not available right now. Sign in with email instead.",
}

const isLoginErrorCode = (value: string): value is LoginErrorCode => value in errorMessages

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next: rawNext } = await searchParams
  const message = error && isLoginErrorCode(error) ? errorMessages[error] : null
  const next = toSafeRelativePath(rawNext) ?? "/account"

  return (
    <AuthShell
      eyebrow="Trade account"
      title="Buyer login"
      description="Sign in to the existing Medusa customer identity. Authentication establishes who you are; approved trading access remains a separate commercial decision."
    >
      {message ? (
        <Alert id="login-error" tone="danger" title="We could not sign you in.">
          {message}
        </Alert>
      ) : null}
      <form
        action={loginAction}
        className="mt-2 space-y-5"
        aria-describedby={message ? "login-error" : undefined}
      >
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            minLength={loginSchema.shape.password.minLength ?? 8}
          />
        </label>
        <Button type="submit" size="lg" className="w-full">
          Sign in
        </Button>
      </form>
      <div className="mt-6 flex items-center gap-3 text-sm text-muted" role="separator">
        <span className="h-px flex-1 bg-line-strong" aria-hidden />
        or
        <span className="h-px flex-1 bg-line-strong" aria-hidden />
      </div>
      <form action={loginWithSsoAction} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" size="lg" className="w-full">
          Continue with ZuriBeans SSO
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        New buyer or supplier?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-semibold text-ink underline underline-offset-4"
        >
          Create a ZuriBeans login
        </Link>
      </p>
    </AuthShell>
  )
}
