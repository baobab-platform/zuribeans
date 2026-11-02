import type { EvidenceItem } from "@/lib/content/evidence"

/**
 * Figma Make trust ribbon specimens. They are never proof of actual ZuriBeans
 * certifications, EUDR compliance, trade-finance facilities or fulfilment.
 * Only route through the explicit isSyntheticExperienceEnabled server gate.
 */
export const DEMO_TRUST_EVIDENCE: readonly EvidenceItem[] = [
  {
    id: "sample-iso-22000",
    label: "ISO 22000",
    description: "Sample · food safety",
    status: "development",
    productionVisible: false,
    icon: "quality-assurance",
  },
  {
    id: "sample-eudr",
    label: "EUDR Ready",
    description: "Sample · EU due diligence",
    status: "development",
    productionVisible: false,
    icon: "traceability",
  },
  {
    id: "sample-utz-ra",
    label: "UTZ / RA",
    description: "Sample · certification",
    status: "development",
    productionVisible: false,
    icon: "quality-assurance",
  },
  {
    id: "sample-cod",
    label: "C.O.D Capable",
    description: "Sample · payment terms",
    status: "development",
    productionVisible: false,
    icon: "trade-documentation",
  },
  {
    id: "sample-docs",
    label: "Full Documentation",
    description: "Sample · phyto / COO / BOL",
    status: "development",
    productionVisible: false,
    icon: "trade-documentation",
  },
  {
    id: "sample-traceability",
    label: "Farm-to-Shipment",
    description: "Sample · traceability",
    status: "development",
    productionVisible: false,
    icon: "traceability",
  },
]
