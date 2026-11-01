import type { Metadata } from "next"
import { JourneyAuth } from "@/components/auth/journey-auth"

export const metadata: Metadata = {
  title: "Supplier registration",
  robots: { index: false, follow: false },
}

export default async function SupplierRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <JourneyAuth journey="supplier" mode="register" error={error} />
}
