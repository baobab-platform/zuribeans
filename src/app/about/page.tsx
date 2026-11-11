import { CorporateHero } from "@/components/marketing/corporate-hero"
import { Card } from "@/components/ui/card"
import { ButtonLink } from "@/components/ui/button"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "About",
  description:
    "ZuriBeans is building accountable sourcing and cross-border trade relationships for African agricultural products.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="About ZuriBeans"
        title="A trading company built around useful evidence."
        description="ZuriBeans connects professional buyers and qualified suppliers through disciplined product representation, market context and accountable commercial execution."
        image={{
          src: "/images/zuribeans-origin-trade-hero-v1.webp",
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
            One accountable commodity trading journey.
          </h2>
        </div>
        <div className="space-y-5 text-base leading-7 text-muted">
          <p>
            We connect professional commodity buyers with potential agricultural suppliers and
            origin-based product classes. Clear specifications, provenance, quality evidence and
            appropriate commercial review guide every trading relationship.
          </p>
          <p>
            Buyers start with a product and procurement requirement; suppliers begin with their
            business, capacity and product evidence. An enquiry is not a confirmed order, and a
            supplier application is not a trading approval. Logistics arrangements are defined for
            each authorised transaction rather than offered as a standalone carrier service.
          </p>
        </div>
      </section>
      <section
        aria-label="Trading relationships"
        className="border-t border-line bg-ink py-12 text-canvas lg:py-16"
      >
        <div className="page-container flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow-inverse">Do business with ZuriBeans</p>
            <h2 className="mt-3 font-display text-3xl font-light sm:text-4xl">
              One trade house. Two distinct relationships.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/buyer" variant="gold">
              Explore buyer procurement
            </ButtonLink>
            <ButtonLink href="/sourcing/become-a-supplier" variant="inverse">
              Explore supplier sourcing
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
