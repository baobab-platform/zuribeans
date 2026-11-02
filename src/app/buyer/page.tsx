import type { Metadata } from "next"
import Link from "next/link"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = getPublicPageMetadata({
  title: "Buyer portal",
  description:
    "Create a buyer account, submit your business application and access approved purchasing services.",
  path: "/buyer",
})

const steps = [
  {
    number: "01",
    title: "Create an account",
    text: "Register or sign in to get started.",
  },
  {
    number: "02",
    title: "Tell us about your business",
    text: "Provide your organisation details and the markets where you want to buy.",
  },
  {
    number: "03",
    title: "Get approved",
    text: "We review your application before enabling purchasing services.",
  },
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
              Explore products, apply for a buyer account and manage your ZuriBeans trading
              relationship after approval.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/buyer/register" className="text-white hover:text-white">
                Create buyer account
              </ButtonLink>
              <ButtonLink href="/buyer/login" variant="inverse">
                Buyer sign in
              </ButtonLink>
            </div>
          </div>
          <div className="border-l-4 border-clay bg-ink-soft p-8">
            <p className="eyebrow-inverse">Procurement workspace</p>
            <h2 className="mt-4 font-display text-3xl font-light">
              Designed for professional buyers.
            </h2>
            <p className="mt-4 text-sm leading-7 text-canvas/75">
              Review your company information and the purchasing services available to your
              organisation. Some features require additional approval.
            </p>
          </div>
        </div>
      </header>
      <section className="page-container py-16">
        <p className="eyebrow">How to begin</p>
        <h2 className="mt-4 font-display text-4xl">How buyer access works.</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.number} className="p-7">
              <p className="text-sm font-bold text-clay-on-light">{step.number}</p>
              <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.text}</p>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          Are you offering agricultural supply instead?{" "}
          <Link
            href="/sourcing/become-a-supplier"
            className="font-semibold text-ink underline underline-offset-4"
          >
            Explore the separate supplier programme
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
