import { FileCheck2, Fingerprint, LockKeyhole, ScanSearch, type LucideIcon } from "lucide-react"
import { SectionHeading } from "@/components/marketing/section-heading"
import { ButtonLink } from "@/components/ui/button"
import type { QualityEvidenceIcon, QualityEvidenceItem } from "@/lib/content/quality"

const EVIDENCE_ICONS: Record<QualityEvidenceIcon, LucideIcon> = {
  context: ScanSearch,
  verification: Fingerprint,
  documentation: FileCheck2,
  access: LockKeyhole,
}

export function QualityEvidence({ items }: { items: readonly QualityEvidenceItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      className="relative overflow-hidden border-y border-line bg-sand/40 py-24 lg:py-32"
      aria-label="Quality and traceability"
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 45%, rgba(181, 126, 45, .16), transparent 42%)",
        }}
        aria-hidden="true"
      />
      <div className="page-container relative grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Quality & traceability"
            title="Confidence is built from evidence."
            description="Useful product context is presented with its status intact—without turning declarations into certifications or public pages into systems of record."
          />
          <ButtonLink href="/quality-traceability" variant="outline" className="mt-8">
            Explore our evidence approach
          </ButtonLink>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2" aria-label="Evidence chain">
          {items.map((item) => {
            const Icon = EVIDENCE_ICONS[item.icon]

            return (
              <li
                key={item.number}
                className="group relative min-h-56 overflow-hidden rounded-panel border border-line bg-surface-raised p-7 shadow-control transition-transform duration-300 hover:-translate-y-1"
              >
                <span
                  className="absolute -right-3 -top-6 font-display text-8xl text-sand transition-colors group-hover:text-clay/15"
                  aria-hidden="true"
                >
                  {item.number}
                </span>
                <div className="relative flex size-12 items-center justify-center rounded-full border border-clay/30 bg-clay/10 text-clay-on-light">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className="relative mt-7 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="relative mt-3 text-sm leading-6 text-muted">{item.detail}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
