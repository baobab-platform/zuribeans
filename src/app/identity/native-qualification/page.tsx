import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { NativeIamQualificationClient } from "@/components/identity/native-iam-qualification-client"

// A first-party browser *qualification* page, not customer account admission.
// Disabled in deployed/protected estates unless the owner explicitly enables
// this disposable development path. Native /auth/* must be TLS-served by the
// reviewed IAM Go BFF at the SAME browser origin; never by this Next process.
export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Governed IAM development qualification",
  robots: { index: false, follow: false },
}

export default function NativeQualificationPage() {
  if (
    process.env.ZURIBEANS_N02_NATIVE_QUALIFICATION_ENABLED !== "true" ||
    process.env.ZURIBEANS_IAM_ENVIRONMENT !== "development"
  ) {
    notFound()
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-20">
      <p className="eyebrow">Private development qualification</p>
      <h1 className="mt-5 font-display text-4xl">
        Governed identity verification
      </h1>
      <p className="mt-5 text-muted">
        This separate IAM session proves only a current authenticated Principal.
        It does not create a ZuriBeans customer, buyer organisation, payment
        mandate, purchasing permission or a Medusa session.
      </p>
      <NativeIamQualificationClient />
    </main>
  )
}
