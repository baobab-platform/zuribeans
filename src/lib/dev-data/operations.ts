import { DEMO_CORRIDORS, DEMO_MARKETS, DEMO_PRODUCTS, type DemoCountry } from "./catalogue"

export type DemoSupplier = {
  id: string
  label: string
  country: DemoCountry
  segment: "cooperative" | "processor" | "exporter" | "aggregator"
  onboarding: "application" | "review" | "needs-information" | "sample-qualified"
  principalId: null
  legalEntityId: null
  evidenceVerification: "synthetic-only"
}
export const DEMO_SUPPLIERS: readonly DemoSupplier[] = DEMO_MARKETS.flatMap((market, i) => [
  {
    id: `demo-supplier-${market.code.toLowerCase()}-1`,
    label: `${market.name} Illustrative Growers Collective ${i + 1}`,
    country: market.code,
    segment: "cooperative" as const,
    onboarding: "application" as const,
    principalId: null,
    legalEntityId: null,
    evidenceVerification: "synthetic-only" as const,
  },
  {
    id: `demo-supplier-${market.code.toLowerCase()}-2`,
    label: `${market.name} Sample Processing House ${i + 1}`,
    country: market.code,
    segment: "processor" as const,
    onboarding: "review" as const,
    principalId: null,
    legalEntityId: null,
    evidenceVerification: "synthetic-only" as const,
  },
])

export type DemoDocumentKind =
  | "commercial-invoice"
  | "packing-list"
  | "origin-evidence"
  | "quality-analysis"
  | "phytosanitary"
  | "export-permit"
  | "import-permit"
  | "transport-document"
  | "insurance-certificate"

export const DEMO_DOCUMENT_KINDS: readonly {
  kind: DemoDocumentKind
  label: string
  authority: "unverified-per-corridor"
}[] = [
  { kind: "commercial-invoice", label: "Commercial invoice", authority: "unverified-per-corridor" },
  { kind: "packing-list", label: "Packing list", authority: "unverified-per-corridor" },
  { kind: "origin-evidence", label: "Origin evidence", authority: "unverified-per-corridor" },
  {
    kind: "quality-analysis",
    label: "Quality/laboratory analysis",
    authority: "unverified-per-corridor",
  },
  {
    kind: "phytosanitary",
    label: "Phytosanitary certificate",
    authority: "unverified-per-corridor",
  },
  {
    kind: "export-permit",
    label: "Export permit (if applicable)",
    authority: "unverified-per-corridor",
  },
  {
    kind: "import-permit",
    label: "Import permit (if applicable)",
    authority: "unverified-per-corridor",
  },
  { kind: "transport-document", label: "Transport document", authority: "unverified-per-corridor" },
  {
    kind: "insurance-certificate",
    label: "Insurance certificate (if applicable)",
    authority: "unverified-per-corridor",
  },
]

export type DemoLot = {
  id: string
  productHandle: string
  origin: DemoCountry
  quantityKg: number
  moisturePercent: number | null
  qcStatus: "sample-unverified" | "sample-pending"
  state: "illustrative"
  events: readonly { stage: "received" | "sampled" | "packaged"; date: string; evidence: null }[]
}
export const DEMO_LOTS: readonly DemoLot[] = DEMO_PRODUCTS.slice(0, 25).map((product, index) => ({
  id: product.lot,
  productHandle: product.handle,
  origin: product.originCountry,
  quantityKg: 500 + (index % 7) * 250,
  moisturePercent: index % 5 === 0 ? null : 9 + (index % 4),
  qcStatus: index % 3 === 0 ? ("sample-pending" as const) : ("sample-unverified" as const),
  state: "illustrative" as const,
  events: [
    { stage: "received" as const, date: "2026-10-01", evidence: null },
    { stage: "sampled" as const, date: "2026-10-03", evidence: null },
    { stage: "packaged" as const, date: "2026-10-05", evidence: null },
  ],
}))

/** Display-only overview; no RFQ, quotation, inventory, TMS or financial record. */
export const DEMO_EXPERIENCE_OVERVIEW = {
  markets: DEMO_MARKETS.length,
  directionalCorridors: DEMO_CORRIDORS.length,
  productRecords: DEMO_PRODUCTS.length,
  suppliers: DEMO_SUPPLIERS.length,
  sampleLots: DEMO_LOTS.length,
  documentationKinds: DEMO_DOCUMENT_KINDS.length,
} as const
