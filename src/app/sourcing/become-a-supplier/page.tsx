import Image from "next/image"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Become a supplier",
  description:
    "Apply to join the ZuriBeans sourcing network with structured business, product, origin and capacity information.",
  alternates: { canonical: "/sourcing/become-a-supplier" },
}

export default function BecomeASupplierPage() {
  return (
    <section className="page-container py-16 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="eyebrow">Supplier sourcing</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl text-balance lg:text-6xl">
            Build a traceable supply relationship with ZuriBeans.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            We welcome structured applications from growers, cooperatives, processors and exporters
            able to describe their products, origin, capacity and operating readiness.
          </p>
          <ButtonLink href="/supplier/apply" size="lg" className="mt-8">
            Start a supplier application
          </ButtonLink>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-surface-muted">
          <Image
            src="/images/zuribeans-origin-trade-hero-v1.webp"
            alt="Coffee cherries, green coffee and prepared export sacks representing origin-to-market supply"
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          ["Business identity", "Legal and registration details for the applying organisation."],
          [
            "Supply capability",
            "Product class, variety, grade, origin, season and indicative capacity.",
          ],
          [
            "Qualification evidence",
            "Certification declarations and supporting information where applicable.",
          ],
        ].map(([title, description]) => (
          <Card key={title}>
            <h2 className="font-display text-xl">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-8 bg-sand/40">
        <h2 className="font-display text-2xl">Before you apply</h2>
        <p className="mt-3 max-w-4xl leading-7 text-muted">
          Submission starts a sourcing review; it does not approve or activate a supplier. Declared
          capabilities and certifications remain unverified until ZuriBeans completes the relevant
          qualification work.
        </p>
      </Card>
    </section>
  )
}
