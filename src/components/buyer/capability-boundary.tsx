import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getUnavailableBuyerSections, type BuyerCapabilitySnapshot } from "@/lib/buyer/capabilities"

export function BuyerCapabilityBoundary({
  capabilities,
}: {
  capabilities: BuyerCapabilitySnapshot | null
}) {
  const unavailableSections = getUnavailableBuyerSections(capabilities)

  if (unavailableSections.length === 0) return null

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Trading workspace</p>
          <h2 className="mt-3 font-display text-2xl">Commercial sections remain unavailable.</h2>
        </div>
        <Badge tone="warning">Restricted</Badge>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
        ZuriBeans will show each section only after the trading platform confirms the organisation
        and its permitted capabilities. A login alone never unlocks commercial data.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="Unavailable buyer sections">
        {unavailableSections.map((section) => (
          <li key={section.key} className="rounded-control border border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{section.label}</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Unavailable
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{section.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
