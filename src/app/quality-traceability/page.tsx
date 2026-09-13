import type { Metadata } from "next"
import { CorporateHero } from "@/components/marketing/corporate-hero"
import { Card } from "@/components/ui/card"
import { QUALITY_LAYERS } from "@/lib/content/corporate-estate"

export const metadata: Metadata = {
  title: "Quality & traceability",
  description: "How ZuriBeans represents product evidence, verification and provenance.",
}

export default function QualityAndTraceabilityPage() {
  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Quality & traceability" }]}
        eyebrow="Quality & traceability"
        title="Confidence needs an evidence trail."
        description="Product information is most useful when its source and verification state are clear. ZuriBeans distinguishes what was declared, reviewed, verified and agreed for a transaction."
      />
      <section className="border-y border-line bg-sand/40 py-16 lg:py-20">
        <div className="page-container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {QUALITY_LAYERS.map((layer, index) => (
            <Card key={layer.title} className="p-7">
              <p className="font-display text-3xl text-clay">0{index + 1}</p>
              <h2 className="mt-7 text-lg font-semibold">{layer.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{layer.detail}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="page-container py-20">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <h2 className="font-display text-4xl">What a useful product record can contain</h2>
          <dl className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
            {[
              ["Provenance", "Origin, supplier and lot context where authoritative."],
              ["Specification", "Grade, processing, packaging and other decision fields."],
              ["Evidence", "Certification or supporting-document references and their status."],
              ["Movement", "Transaction and logistics records linked when contracts provide them."],
            ].map(([term, detail]) => (
              <div key={term} className="bg-surface-raised p-6">
                <dt className="font-semibold">{term}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
