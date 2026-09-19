import type { TradeMapRole } from "@/lib/content/market-presentation"

const LEGEND: Record<TradeMapRole, { label: string; markerClassName: string }> = {
  origin: {
    label: "Origin capability",
    markerClassName: "rounded-full bg-clay",
  },
  destination: {
    label: "Buyer market",
    markerClassName: "rotate-45 border border-clay-inverse bg-ink",
  },
}

export function MapLegend({ roles }: { roles: readonly TradeMapRole[] }) {
  return (
    <ul aria-label="Map legend" className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
      {[...new Set(roles)].map((role) => (
        <li key={role} className="flex items-center gap-2 text-white/75">
          <span
            className={`size-2.5 shrink-0 ${LEGEND[role].markerClassName}`}
            aria-hidden="true"
          />
          {LEGEND[role].label}
        </li>
      ))}
    </ul>
  )
}
