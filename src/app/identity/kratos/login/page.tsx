import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { NativeKratosFlowForm } from "@/components/identity/native-kratos-flow-form"

// These are owner-controlled, development-only Kratos self-service UIs.
// Kratos remains the sole authority for credentials, CSRF, assurance and
// recovery. They MUST be configured as exact Kratos public browser ui_url.
export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const metadata: Metadata = {
  title: "Governed IAM login and step-up",
  robots: { index: false, follow: false },
}

export default function NativeLoginPage() {
  if (
    process.env.ZURIBEANS_N02_NATIVE_QUALIFICATION_ENABLED !== "true" ||
    process.env.ZURIBEANS_IAM_ENVIRONMENT !== "development"
  ) {
    notFound()
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-20">
      <p className="eyebrow">Private development qualification</p>
      <h1 className="mt-4 font-display text-4xl">Governed IAM login and step-up</h1>
      <p className="mt-4 text-muted">
        This is a genuine Kratos-managed authentication / AAL2 browser ceremony. Completing it does
        not create a Control Plane Principal or purchasing authority.
      </p>
      <NativeKratosFlowForm kind="login" />
    </main>
  )
}
