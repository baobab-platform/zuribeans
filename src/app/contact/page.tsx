import type { Metadata } from "next"
import { CorporateHero } from "@/components/marketing/corporate-hero"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact",
  description: "Discuss a sourcing, product or cross-border trade requirement with ZuriBeans.",
}

export default function ContactPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="Trade enquiries"
        title="Start with a defined requirement."
        description="Tell the trade desk what product you need, the relevant specification and volume, where it must arrive, and your intended timing."
      />
      <section className="page-container grid gap-6 pb-20 md:grid-cols-2 lg:pb-24">
        <Card className="p-8">
          <p className="eyebrow">Buyers</p>
          <h2 className="mt-4 font-display text-3xl">Discuss a procurement need.</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Include your organisation, destination market, product, specification, volume and target
            timing. A public enquiry does not expose or generate buyer-specific terms.
          </p>
          <ButtonLink
            href="mailto:trade@zuribeans.com?subject=Buyer%20trade%20requirement"
            className="mt-7"
          >
            Email the trade desk
          </ButtonLink>
        </Card>
        <Card className="p-8">
          <p className="eyebrow">Suppliers</p>
          <h2 className="mt-4 font-display text-3xl">Enter the qualification journey.</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            Supplier applications use the existing structured workflow so business, product,
            capacity and certification information can be reviewed consistently.
          </p>
          <ButtonLink href="/sourcing/become-a-supplier" variant="outline" className="mt-7">
            Review supplier requirements
          </ButtonLink>
        </Card>
      </section>
    </>
  )
}
