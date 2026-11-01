import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldDescription, Input } from "@/components/ui/form-controls"
import { loginSchema } from "@/lib/validation/login"
import { toSafeRelativePath } from "@/lib/auth/safe-redirect"
import { loginAction, loginWithSsoAction, type LoginErrorCode } from "@/app/login/actions"
import { registerAction, type RegisterErrorCode } from "@/app/register/actions"

type Journey = "buyer" | "supplier"
type Mode = "login" | "register"

const loginErrors: Record<LoginErrorCode, string> = {
  invalid_input: "Enter a valid business email and password.",
  invalid_credentials: "That email and password combination is not recognised.",
  sso_unavailable: "Secure single sign-on is temporarily unavailable. Use your email and password.",
}
const registerErrors: Record<RegisterErrorCode, string> = {
  invalid_input: "Check all required fields and confirm that your passwords match.",
  email_taken: "An account with this email already exists. Sign in instead.",
  failed: "We could not complete registration. Please try again.",
}

export function JourneyAuth({
  journey,
  mode,
  error,
  requestedNext,
}: {
  journey: Journey
  mode: Mode
  error?: string
  requestedNext?: string
}) {
  const buyer = journey === "buyer"
  const defaultNext = buyer ? "/account" : "/supplier"
  const allowedNext = toSafeRelativePath(requestedNext)
  const next =
    allowedNext &&
    (buyer ? allowedNext.startsWith("/account") : allowedNext.startsWith("/supplier"))
      ? allowedNext
      : defaultNext
  const afterRegistration = buyer ? "/account/apply" : "/supplier/apply"
  const prefix = buyer ? "/buyer" : "/supplier"
  const title =
    mode === "login"
      ? buyer
        ? "Sign in to your trading account."
        : "Sign in to your supplier account."
      : buyer
        ? "Start your buyer application."
        : "Create your supplier login."
  const description =
    mode === "login"
      ? buyer
        ? "Access your organisation, commercial review and approved procurement capabilities."
        : "Manage your supply application, supporting evidence and qualification status."
      : buyer
        ? "Establish a secure identity, then apply for buyer organisation approval. Registration is not authority to purchase."
        : "Establish a secure identity, then submit your supplier organisation for sourcing review. Registration is not approval to supply."
  const message =
    mode === "login"
      ? error && error in loginErrors
        ? loginErrors[error as LoginErrorCode]
        : null
      : error && error in registerErrors
        ? registerErrors[error as RegisterErrorCode]
        : null

  return (
    <AuthShell
      eyebrow={buyer ? "Buyer portal" : "Supplier portal"}
      title={title}
      description={description}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-clay-on-light">
        {mode === "login" ? "Secure sign in" : "Organisation registration"}
      </p>
      {message ? (
        <Alert tone="danger" title="Your request could not be completed.">
          {message}
        </Alert>
      ) : null}
      {mode === "login" ? (
        <>
          <form action={loginAction} className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="journey" value={journey} />
            <label className="block text-sm font-semibold">
              Business email
              <Input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="block text-sm font-semibold">
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
              Sign in to {buyer ? "buyer" : "supplier"} workspace
            </Button>
          </form>
          {buyer ? (
            <>
              <div className="my-4 flex items-center gap-3 text-sm text-muted">
                <span aria-hidden="true" className="h-px flex-1 bg-line-strong" />
                or
                <span aria-hidden="true" className="h-px flex-1 bg-line-strong" />
              </div>
              <form action={loginWithSsoAction}>
                <input type="hidden" name="next" value={next} />
                <input type="hidden" name="journey" value={journey} />
                <Button type="submit" size="lg" variant="outline" className="w-full">
                  Continue with secure buyer SSO
                </Button>
              </form>
            </>
          ) : (
            <p className="mt-3 text-xs leading-5 text-muted">
              Supplier single sign-on is not yet qualified. Use your existing email and password for
              the supplier application and review workspace.
            </p>
          )}
        </>
      ) : (
        <form action={registerAction} className="space-y-5">
          <input type="hidden" name="journey" value={journey} />
          <input type="hidden" name="next" value={afterRegistration} />
          <label className="block text-sm font-semibold">
            Organisation name
            <Input name="companyName" type="text" required autoComplete="organization" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              First name
              <Input name="firstName" type="text" required autoComplete="given-name" />
            </label>
            <label className="block text-sm font-semibold">
              Last name
              <Input name="lastName" type="text" required autoComplete="family-name" />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Business email
            <Input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="journey-password-help"
            />
            <FieldDescription id="journey-password-help">
              At least eight characters.
            </FieldDescription>
          </label>
          <label className="block text-sm font-semibold">
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
            Create {buyer ? "buyer" : "supplier"} login
          </Button>
        </form>
      )}
      <div className="mt-4 space-y-2 border-t border-line pt-3 text-sm">
        <p className="text-muted">
          {mode === "login" ? "New to ZuriBeans?" : "Already registered?"}{" "}
          <Link
            className="font-bold text-ink underline underline-offset-4"
            href={mode === "login" ? `${prefix}/register` : `${prefix}/login`}
          >
            {mode === "login" ? `Create a ${journey} login` : "Sign in"}
          </Link>
        </p>
        <p className="text-muted">
          {buyer ? "Are you a supplier?" : "Buying from ZuriBeans?"}{" "}
          <Link
            className="font-bold text-ink underline underline-offset-4"
            href={buyer ? "/supplier/login" : "/buyer/login"}
          >
            {buyer ? "Supplier portal" : "Buyer portal"}
          </Link>
        </p>
        <p className="text-xs leading-5 text-muted">
          Both journeys use the existing secure sign-in provider, but access, organisational
          approval and trading mandates are independently governed.
        </p>
      </div>
    </AuthShell>
  )
}
