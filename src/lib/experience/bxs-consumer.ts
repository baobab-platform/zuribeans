import { toAccessibleChartTable, type ChartSeriesProjection } from "@baobab-platform/experience-charts"
import {
  boundsForPositions,
  locationLabel,
  type LonLat,
} from "@baobab-platform/experience-geo-core"
import {
  toEvidenceRows,
  validateEvidenceProjection,
  type EvidenceProjection,
} from "@baobab-platform/experience-geo-deckgl"
import {
  validatePoints,
  validateResourcePolicy,
  type MapProjection,
  type MapResourcePolicy,
} from "@baobab-platform/experience-geo-maplibre/model"

/**
 * BXS-05 ZuriBeans consumer seam. The estate/BFF must first classify and
 * redact the caller's authorised display models. This file only validates
 * and projects those models into accessible text/table structures.
 *
 * MapLibre and deck.gl rendering remain opt-in: importing their evidence
 * models does not select a tile vendor, initialise WebGL, grant market
 * authority, or fetch an IAM/CP/TMS/Trade provider.
 */
export type BxsReadOnlyInput = Readonly<{
  chart: ChartSeriesProjection
  map: MapProjection
  mapResources: MapResourcePolicy
  overlay: EvidenceProjection
  frameAt: string
}>

export function composeBxsReadOnly(input: BxsReadOnlyInput) {
  validateResourcePolicy(input.mapResources)
  const chart = toAccessibleChartTable(input.chart)
  const overlay = validateEvidenceProjection(input.overlay)

  let mapState: "restricted" | "authorised"
  let mapExplanation: string | null = null
  let mapRows: readonly Readonly<{
    id: string
    label: string
    evidenceReference: string
    freshness: string
    description: string
  }>[] = []
  let mapBounds: ReturnType<typeof boundsForPositions> = null

  if (input.map.visibility === "restricted") {
    if ("points" in input.map || "projectionReference" in input.map) {
      throw new TypeError("Restricted geography must not carry protected map data")
    }
    mapState = "restricted"
    mapExplanation = input.map.explanation
  } else if (input.map.visibility === "authorised") {
    if (!input.map.projectionReference.trim()) {
      throw new TypeError("Missing BFF-owned map projection reference")
    }
    validatePoints(input.map.points)
    const positions: LonLat[] = []
    mapRows = Object.freeze(
      input.map.points.map((point) => {
        if (point.observation.position !== null) {
          positions.push(point.observation.position)
        }
        // Deliberately discard all unrecognised transport/authority metadata.
        return Object.freeze({
          id: point.id,
          label: point.label,
          evidenceReference: point.evidenceReference,
          freshness: point.freshness,
          description: locationLabel(point.observation),
        })
      }),
    )
    mapBounds = boundsForPositions(positions)
    mapState = "authorised"
  } else {
    throw new TypeError("Unknown map projection visibility")
  }

  // Each timestamp is an actual frame selector, never an interpolation.
  // Denied and unrecognised frames disclose no point or source metadata.
  const overlayRows = toEvidenceRows(overlay, input.frameAt)

  return Object.freeze({
    chart,
    mapState,
    mapExplanation,
    mapRows,
    mapBounds,
    overlayState: overlay.visibility,
    overlayRows,
    // Even an approved tile origin is insufficient without a reviewed CSP,
    // MapLibre worker, licensing and browser acceptance. Never auto-enable.
    interactiveMapEnabled: false as const,
  })
}
