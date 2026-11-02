import { notFound } from "next/navigation"
import { FeedbackPanel, StatusLabel } from "@baobab-platform/experience-ui"
import type { ChartSeriesProjection } from "@baobab-platform/experience-charts"
import type { EvidenceProjection } from "@baobab-platform/experience-geo-deckgl"
import type {
  MapProjection,
  MapResourcePolicy,
} from "@baobab-platform/experience-geo-maplibre/model"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import { composeBxsReadOnly } from "@/lib/experience/bxs-consumer"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "BXS Six-Package Inspection | ZuriBeans Development",
  robots: { index: false, follow: false },
}

// Deterministic FICTIONAL specimens, never CP/Trade/market evidence.
const specimenTime = "2026-11-02T00:00:00Z"
const chart: ChartSeriesProjection = {
  title: "Synthetic test fixture counts",
  valueLabel: "Fictional samples",
  unitLabel: "sample records",
  availability: "available",
  sourceReference: "ZB-DEV-BXS / synthetic-only",
  asOf: specimenTime,
  points: [
    { id: "a", label: "Specimen A", value: 2 },
    { id: "b", label: "Specimen B", value: null },
    { id: "c", label: "Specimen C", value: 4 },
  ],
}
const map: MapProjection = {
  visibility: "authorised",
  projectionReference: "synthetic:zb-bxs-inspection-v1",
  points: [
    {
      id: "fictional-a",
      label: "Fictional point A",
      evidenceReference: "ZB-DEV-BXS-A",
      freshness: "unknown",
      observation: {
        kind: "milestone-derived",
        position: [12, -15],
        source: "Synthetic test fixture (not an observation)",
        observedAt: null,
      },
    },
  ],
}
// Empty external origins intentionally prohibit network map assets.
const mapResources: MapResourcePolicy = {
  allowedOrigins: [],
  attribution: "Synthetic fixture; no external map is loaded",
  licenceReference: "No tile, style or worker provider approved",
}
const overlay: EvidenceProjection = {
  visibility: "authorised",
  projectionReference: "synthetic:zb-bxs-overlay-v1",
  sourceReference: "ZB-DEV-BXS / fictional evidence",
  frames: [
    {
      at: specimenTime,
      points: [
        {
          id: "fictional-a",
          label: "Fictional point A",
          evidenceReference: "ZB-DEV-BXS-A",
          freshness: "unknown",
          observation: {
            kind: "milestone-derived",
            position: [12, -15],
            source: "Synthetic test fixture (not a movement event)",
            observedAt: null,
          },
        },
      ],
    },
  ],
}

export default function BxsDevelopmentPage() {
  if (!isSyntheticExperienceEnabled()) notFound()
  const view = composeBxsReadOnly({
    chart,
    map,
    mapResources,
    overlay,
    frameAt: specimenTime,
  })

  return (
    <section data-bx-theme="zuribeans" className="page-container space-y-8 py-16">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow">BXS-05 · Development-only consumer inspection</p>
        <h1 className="font-display text-5xl">Baobab Experience System</h1>
        <StatusLabel tone="info">Synthetic specimens · not operational evidence</StatusLabel>
        <p className="text-muted">
          Exact published BXS tokens, UI, chart, geography-core, MapLibre model and deck.gl evidence
          contracts are consumed here. Nothing on this page identifies a real buyer, supplier,
          shipment, active market, legal approval or available trade capability.
        </p>
      </header>

      <section
        aria-labelledby="bxs-chart-title"
        className="rounded-panel border border-line bg-surface p-6"
      >
        <h2 id="bxs-chart-title" className="font-display text-3xl">
          Accessible chart data
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="pb-3 text-left font-semibold">{view.chart.caption}</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-3">
                  {view.chart.labelColumn}
                </th>
                <th scope="col" className="p-3">
                  {view.chart.valueColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {view.chart.rows.map((row) => (
                <tr key={row.id} className="border-b border-line">
                  <th scope="row" className="p-3 font-normal">
                    {row.label}
                  </th>
                  <td className="p-3">{row.displayValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Source: {view.chart.sourceReference} · As of: {view.chart.asOf} · Unit:{" "}
          {view.chart.unitLabel}
        </p>
      </section>

      <section aria-labelledby="bxs-geo-title" className="space-y-4">
        <h2 id="bxs-geo-title" className="font-display text-3xl">
          Geography and evidence
        </h2>
        <p className="text-muted">
          Geographic bounds, observations and timestamp-specific overlay frames use Shared
          validation. This inspection intentionally exposes only an accessible evidence list.
        </p>
        <ul className="space-y-3" aria-label="Synthetic location evidence">
          {view.mapRows.map((row) => (
            <li key={row.id} className="rounded-panel border border-line bg-surface p-5">
              <strong>{row.label}</strong>
              <p className="mt-2 text-sm text-muted">{row.description}</p>
              <p className="mt-1 text-xs text-muted">
                Freshness: {row.freshness} · Evidence: {row.evidenceReference}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          Overlay frame: {specimenTime} · {view.overlayRows.length} fictional row(s). No
          interpolation, routing or simulated carrier data.
        </p>
        <FeedbackPanel
          state="unavailable"
          title="Interactive geography deliberately inactive"
          description="No tile provider, licence, worker asset or CSP admission has been approved. MapLibre and deck.gl rendering remain disabled; the source-labelled text alternative is available."
        />
      </section>
    </section>
  )
}
