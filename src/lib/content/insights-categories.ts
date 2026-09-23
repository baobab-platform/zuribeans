/**
 * Extensible Insights category registry (see ADR-0011). Add a category by
 * adding an entry here — never by adding topic-specific branching to a
 * component, the same rule `src/lib/supplier/categories.ts` applies to
 * supplier product categories.
 */
export type InsightCategory = {
  key: string
  label: string
}

export const INSIGHT_CATEGORIES: readonly InsightCategory[] = [
  { key: "sourcing", label: "Sourcing & Procurement" },
  { key: "trade-logistics", label: "Trade & Logistics" },
  { key: "quality-compliance", label: "Quality & Compliance" },
  { key: "market-intelligence", label: "Market Intelligence" },
  { key: "company-news", label: "Company News" },
]

export const isInsightCategoryKey = (value: string): boolean =>
  INSIGHT_CATEGORIES.some((category) => category.key === value)

export const getInsightCategory = (key: string): InsightCategory | undefined =>
  INSIGHT_CATEGORIES.find((category) => category.key === key)
