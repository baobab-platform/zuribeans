import { describe, expect, it } from "vitest"
import type { ChartSeriesProjection } from "@baobab-platform/experience-charts"
import type { MapProjection, MapResourcePolicy } from "@baobab-platform/experience-geo-maplibre/model"
import type { EvidenceProjection } from "@baobab-platform/experience-geo-deckgl"
import { approvedResourceUrl } from "@baobab-platform/experience-geo-maplibre/model"
import { assertLonLat } from "@baobab-platform/experience-geo-core"
import { composeBxsReadOnly } from "./bxs-consumer"

const when = "2026-11-02T00:00:00Z"
const resources: MapResourcePolicy = {
  allowedOrigins: [],
  attribution: "Fixture only",
  licenceReference: "No tiles licensed",
}
const chart: ChartSeriesProjection = {
  title: "Fixture evidence",
  valueLabel: "Samples",
  unitLabel: "records",
  availability: "available",
  sourceReference: "synthetic-test",
  asOf: when,
  points: [{ id: "one", label: "One", value: null }],
}
const observation = {
  kind: "milestone-derived" as const,
  position: [12, -15] as const,
  source: "synthetic fixture only",
  observedAt: null,
}
const map: MapProjection = {
  visibility: "authorised",
  projectionReference: "synthetic:scope-1",
  points: [
    {
      id: "one",
      label: "Fictional point",
      evidenceReference: "source-1",
      freshness: "unknown",
      observation,
    },
  ],
}
const overlay: EvidenceProjection = {
  visibility: "authorised",
  projectionReference: "synthetic:scope-1",
  sourceReference: "synthetic-test",
  frames: [
    {
      at: when,
      points: [
        {
          id: "one",
          label: "Fictional point",
          evidenceReference: "source-1",
          freshness: "unknown",
          observation,
        },
      ],
    },
  ],
}
const input = { chart, map, mapResources: resources, overlay, frameAt: when }

describe("BXS six-package consumer seam (source/synthetic only)", () => {
  it("provides a complete tabular alternative without manufacturing missing values", () => {
    const view = composeBxsReadOnly(input)
    expect(view.chart.rows[0]?.displayValue).toBe("Not reported")
    expect(view.chart.sourceReference).toBe("synthetic-test")
    expect(view.mapBounds).toMatchObject({ west: 12, east: 12, south: -15, north: -15 })
    expect(view.mapRows[0]?.description).toContain("synthetic fixture only")
    expect(view.overlayRows).toHaveLength(1)
    expect(view.interactiveMapEnabled).toBe(false)
  })

  it("fails closed for restricted charts, maps and deck.gl overlays", () => {
    const view = composeBxsReadOnly({
      ...input,
      chart: {
        ...chart,
        availability: "restricted",
        sourceReference: null,
        asOf: null,
        points: [],
      },
      map: { visibility: "restricted", explanation: "No grant" },
      overlay: { visibility: "restricted", explanation: "No grant" },
    })
    expect(view.chart.rows).toHaveLength(0)
    expect(view.mapRows).toHaveLength(0)
    expect(view.overlayRows).toHaveLength(0)
    expect(view.mapState).toBe("restricted")
    expect(view.mapBounds).toBeNull()
  })

  it("refuses forged chart data, invalid coordinates and unknown map origins", () => {
    expect(() =>
      composeBxsReadOnly({
        ...input,
        chart: { ...chart, points: [{ id: "one", label: "One", value: Number.NaN }] },
      }),
    ).toThrow()
    expect(() => assertLonLat([181, 0])).toThrow()
    expect(() =>
      approvedResourceUrl("https://tile.openstreetmap.org/0/0/0.png", resources),
    ).toThrow()
    expect(() =>
      composeBxsReadOnly({
        ...input,
        map: { visibility: "authorised", projectionReference: "", points: [] },
      }),
    ).toThrow()
  })

  it("never reuses a different or unknown overlay timestamp as observed evidence", () => {
    const view = composeBxsReadOnly({ ...input, frameAt: "2026-11-03T00:00:00Z" })
    expect(view.overlayRows).toHaveLength(0)
  })
})
