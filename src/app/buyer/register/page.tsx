import type { Metadata } from "next"
import { JourneyAuth } from "@/components/auth/journey-auth"

export const metadata: Metadata = {
  title: "Buyer registration",
  robots: { index: false, follow: false },
}

export default async function BuyerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <JourneyAuth journey="buyer" mode="register" error={error} />
}
