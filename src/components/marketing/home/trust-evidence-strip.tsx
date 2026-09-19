import { BadgeCheck, FileCheck2, Route, ShieldCheck, type LucideIcon } from "lucide-react"
import type { EvidenceIcon, EvidenceItem } from "@/lib/content/evidence"

const EVIDENCE_ICONS: Record<EvidenceIcon, LucideIcon> = {
  "supplier-verification": ShieldCheck,
  traceability: Route,
  "quality-assurance": BadgeCheck,
  "trade-documentation": FileCheck2,
}

type TrustEvidenceStripProps = {
  items: readonly EvidenceItem[]
}

export function TrustEvidenceStrip({ items }: TrustEvidenceStripProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section aria-label="Trade assurance" className="border-y border-line bg-surface-raised">
      <ul className="page-container grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = EVIDENCE_ICONS[item.icon]

          return (
            <li key={item.id} className="flex gap-4 py-7 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-clay"
                aria-hidden="true"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-display text-lg leading-6">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
