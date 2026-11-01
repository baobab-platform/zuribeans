import type { Metadata } from "next"
import { JourneyAuth } from "@/components/auth/journey-auth"

export const metadata: Metadata = {
  title: "Buyer sign in",
  robots: { index: false, follow: false },
}

export default async function BuyerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return <JourneyAuth requestedNext={next} journey="buyer" mode="login" error={error} />
}
