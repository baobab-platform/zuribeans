export type EvidenceStatus = "verified" | "development" | "planned"

export type EvidenceIcon =
  "supplier-verification" | "traceability" | "quality-assurance" | "trade-documentation"

export type EvidenceItem = {
  id: string
  label: string
  description: string
  status: EvidenceStatus
  productionVisible: boolean
  icon: EvidenceIcon
}

export type EvidenceEnvironment = "development" | "production" | "test"

export function getVisibleEvidence(
  items: readonly EvidenceItem[],
  environment: EvidenceEnvironment = process.env.NODE_ENV,
): readonly EvidenceItem[] {
  if (environment !== "production") {
    return items
  }

  return items.filter((item) => item.status === "verified" && item.productionVisible)
}
