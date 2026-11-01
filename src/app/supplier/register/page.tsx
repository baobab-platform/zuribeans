import type { Metadata } from "next"
import { JourneyAuth } from "@/components/auth/journey-auth"

export const metadata: Metadata = {
  title: "Supplier registration",
  robots: { index: false, follow: false },
}

export default async function SupplierRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return <JourneyAuth requestedNext={next} journey="supplier" mode="register" error={error} />
}
