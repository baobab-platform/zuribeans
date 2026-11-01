import type { Metadata } from "next"
import Link from "next/link"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = getPublicPageMetadata({
  title: "Buyer portal",
  description: "Create an account, apply for buyer organisation approval and access verified procurement capabilities.",
  path: "/buyer",
})

const steps = [
  { number: "01", title: "Secure identity", text: "Create your buyer login or use your existing secure sign-in." },
  { number: "02", title: "Organisation verification", text: "Submit your legal trading identity and requested markets for KYB and commercial review." },
  { number: "03", title: "Trade authorisation", text: "The responsible platform confirms allowed capabilities before any buyer-specific transactions." },
] as const

export default function BuyerPortalPage() {
  return (
    <div className="bg-canvas">
      <header className="bg-ink py-16 text-canvas lg:py-24">
        <div className="page-container grid items-end gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="eyebrow-inverse">Buyer portal / professional procurement</p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,5vw,4.5rem)] font-light leading-[1.06] text-balance">
              Your gateway to African-origin trade.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-canvas/80">
              Discover product specifications, request commercial review and manage your approved trading relationship with ZuriBeans.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/buyer/register" className="text-white hover:text-white">Create buyer account</ButtonLink>
              <ButtonLink href="/buyer/login" variant="inverse">Buyer sign in</ButtonLink>
            </div>
          </div>
          <div className="border-l-4 border-clay bg-ink-soft p-8">
            <p className="eyebrow-inverse">Procurement workspace</p>
            <h2 className="mt-4 font-display text-3xl font-light">Designed for professional buyers.</h2>
            <p className="mt-4 text-sm leading-7 text-canvas/75">
              Organisation profiles, team access, RFQs, quotations, orders, documents and shipments follow distinct approval and provider capabilities. Unavailable features remain visibly restricted—not simulated as live transactions.
            </p>
          </div>
        </div>
      </header>
      <section className="page-container py-16">
        <p className="eyebrow">How to begin</p>
        <h2 className="mt-4 font-display text-4xl">A governed path to procurement.</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.number} className="p-7">
              <p className="text-sm font-bold text-clay-on-light">{step.number}</p>
              <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">Are you offering agricultural supply instead? <Link href="/sourcing/become-a-supplier" className="font-semibold text-ink underline underline-offset-4">Explore the separate supplier programme</Link>.</p>
      </section>
    </div>
  )
}
