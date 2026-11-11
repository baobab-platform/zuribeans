/**
 * Display-only public product dossier projection.
 *
 * The fixture producer supplies complete sample values in local development.
 * Authoritative consumers MUST only populate fields actually published by their
 * own engine. Neither this type nor a "verified" fixture status grants any
 * transaction, document custody or regulatory authority.
 */
export type DossierField = { label: string; value: string }
export type DossierCertification = {
  name: string
  scheme: string
  certificateId: string
  issuer: string
  status: "valid" | "pending" | "expired"
  validUntil: string | null
  scope: string
}
export type DossierDocument = {
  id: string
  title: string
  kind: string
  reference: string
  status: "available" | "pending" | "review"
  issuedAt: string | null
  issuer: string
  /** No download URLs are part of synthetic preview data. */
}
export type DossierTradeTerms = {
  incoterms: readonly string[]
  namedPlace: string
  transport: string
  packing: string
  minimumOrder: string
  samplePolicy: string
  payment: string
  shippingLeadTime: string
  availableQuantity: string
  supplyStatus: string
  availabilityAsOf: string
  destinationMarkets: readonly string[]
}
export type ProductDossierData = {
  provenance: readonly DossierField[]
  quality: readonly DossierField[]
  certifications: readonly DossierCertification[]
  documents: readonly DossierDocument[]
  terms: DossierTradeTerms | null
  highlights: readonly DossierField[]
}
