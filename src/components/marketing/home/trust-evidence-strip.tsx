import type { EvidenceItem } from "@/lib/content/evidence"

/**
 * Figma Make TrustStrip: compact, continuous forest-green assurance ribbon.
 * Labels and supporting copy come exclusively from governed public evidence;
 * prototype-only certification and trade-finance claims are not adopted.
 */
export function TrustEvidenceStrip({ items }: { items: readonly EvidenceItem[] }) {
  if (items.length === 0) return null

  return (
    <section
      aria-label="Trade assurance"
      className="w-full max-w-full overflow-x-auto border-b border-white/10 bg-ink-soft text-white"
      style={{ WebkitOverflowScrolling: "touch" }}
      tabIndex={0}
    >
      <ul
        className="mx-auto flex min-w-max max-w-[var(--container-page)]"
        style={{ paddingInline: "1.25rem" }}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="flex shrink-0 flex-col justify-center border-r border-white/10 last:border-r-0"
            style={{ minWidth: "140px", padding: "18px 28px" }}
          >
            <span
              className="text-xs font-bold uppercase text-clay-inverse"
              style={{ letterSpacing: "0.07em" }}
            >
              {item.label}
            </span>
            <span
              className="text-[11px] leading-4 text-white/70"
              style={{ marginTop: "3px", maxWidth: "240px" }}
            >
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
