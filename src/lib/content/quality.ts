export type QualityEvidenceIcon = "context" | "verification" | "documentation" | "access"

export type QualityEvidenceItem = {
  number: string
  title: string
  detail: string
  icon: QualityEvidenceIcon
}

export const QUALITY_EVIDENCE_ITEMS = [
  {
    number: "01",
    title: "Lot context",
    detail:
      "Origin, grade, processing and packaging are shown when an authoritative source exists.",
    icon: "context",
  },
  {
    number: "02",
    title: "Status made visible",
    detail: "Declared information remains visibly distinct from reviewed or verified evidence.",
    icon: "verification",
  },
  {
    number: "03",
    title: "Transaction record",
    detail:
      "Commercial and trade documentation follows the agreed transaction, not an isolated page.",
    icon: "documentation",
  },
  {
    number: "04",
    title: "Controlled disclosure",
    detail: "Buyer-specific prices, terms and records remain behind the appropriate authorization.",
    icon: "access",
  },
] as const satisfies readonly QualityEvidenceItem[]
