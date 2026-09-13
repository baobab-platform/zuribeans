import type { Metadata } from "next"
import { CorporateHero } from "@/components/marketing/corporate-hero"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About",
  description:
    "ZuriBeans is building accountable sourcing and cross-border trade relationships for African agricultural products.",
}

export default function AboutPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="About ZuriBeans"
        title="A trading company built around useful evidence."
        description="ZuriBeans connects professional buyers and qualified suppliers through disciplined product representation, market context and accountable commercial execution."
        image={{
          src: "/images/zuribeans-origin-trade-hero.webp",
          alt: "Coffee, vanilla and export preparation representing the ZuriBeans trading estate",
          position: "center 55%",
        }}
      />
      <section className="border-y border-line bg-surface-raised py-16 lg:py-20">
        <div className="page-container grid gap-6 md:grid-cols-3">
          {[
            [
              "Clear provenance",
              "Origin and product information should remain connected to its source.",
            ],
            [
              "Commercial discipline",
              "Terms belong to the account, market and transaction that authorize them.",
            ],
            [
              "Durable relationships",
              "The estate is designed for repeat trade, not an anonymous consumer checkout.",
            ],
          ].map(([title, detail]) => (
            <Card key={title} className="p-7">
              <h2 className="font-display text-2xl">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="page-container grid gap-12 py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="eyebrow">Our role</p>
          <h2 className="mt-4 font-display text-4xl text-balance">
            One accountable trading journey.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-7 text-muted">
          <p>
            The public estate helps counterparties understand products, markets, sourcing standards
            and the path to doing business. Authenticated experiences support approved buyers and
            the existing ZuriBeans-owned supplier lifecycle.
          </p>
          <p>
            ZuriBeans does not turn the browser into a collection of direct platform integrations.
            The application layer and its adapters remain responsible for communicating with Baobab
            Trade, IAM, Control Plane, ERP and future CMS services.
          </p>
        </div>
      </section>
    </>
  )
}
