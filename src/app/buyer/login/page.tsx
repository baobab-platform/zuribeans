import type { Metadata } from "next"
import { JourneyAuth } from "@/components/auth/journey-auth"

export const metadata: Metadata = {
  title: "Buyer sign in",
  robots: { index: false, follow: false },
}

export default async function BuyerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <JourneyAuth journey="buyer" mode="login" error={error} />
}
