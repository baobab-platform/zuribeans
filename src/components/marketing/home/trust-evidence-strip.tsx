import type { EvidenceItem } from "@/lib/content/evidence"

const stripClassName = "overflow-x-auto border-b border-white/10 bg-ink-soft text-white"
const listClassName = "mx-auto flex min-w-max max-w-[var(--container-page)] px-5"
const itemClassName =
  "flex min-w-[180px] shrink-0 flex-col justify-center border-r border-white/10 px-6 py-5 first:pl-0 last:border-r-0"

/**
 * Compact Figma Make assurance ribbon using governed public evidence only.
 */
export function TrustEvidenceStrip({ items }: { items: readonly EvidenceItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section aria-label="Trade assurance" className={stripClassName}>
      <ul className={listClassName}>
        {items.map((item, index) => (
          <li key={item.id} className={itemClassName}>
            <span className="text-xs font-bold uppercase tracking-[.07em] text-clay-inverse">
              {item.label}
            </span>
            <span className="mt-1 max-w-[240px] text-[11px] leading-4 text-white/70">
              {item.description}
            </span>
            <span className="sr-only">{index + 1} of {items.length}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
