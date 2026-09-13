import type { Metadata } from "next"
import { CorporateHero } from "@/components/marketing/corporate-hero"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sourcing",
  description: "How ZuriBeans engages and qualifies agricultural suppliers.",
}

export default function SourcingPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sourcing" }]}
        eyebrow="Supplier network"
        title="Qualification starts with a clear supply picture."
        description="Growers, cooperatives, exporters and other eligible suppliers can present business, product, origin, capacity and certification information for structured review."
        image={{
          src: "/images/zuribeans-origin-trade-hero.webp",
          alt: "Agricultural products and export preparation at origin",
          position: "left center",
        }}
      />
      <section className="border-y border-line bg-surface-raised py-16">
        <div className="page-container">
          <h2 className="font-display text-4xl">What the application establishes</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Business identity", "Registration, operating country and responsible contacts."],
              ["Supply capability", "Product classes, origin, grade and indicative capacity."],
              ["Supporting evidence", "Certification and document references where available."],
              ["Review status", "A visible lifecycle from draft through review and decision."],
            ].map(([title, detail]) => (
              <Card key={title} className="p-6">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
              </Card>
            ))}
          </div>
          <ButtonLink href="/sourcing/become-a-supplier" className="mt-9">
            Review supplier requirements
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
