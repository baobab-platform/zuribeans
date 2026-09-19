import { describe, expect, it } from "vitest"
import { getVisibleEvidence, type EvidenceItem } from "@/lib/content/evidence"

const items: readonly EvidenceItem[] = [
  {
    id: "verified",
    label: "Verified",
    description: "Authoritative evidence.",
    status: "verified",
    productionVisible: true,
    icon: "quality-assurance",
  },
  {
    id: "development",
    label: "Development",
    description: "Development-only concept.",
    status: "development",
    productionVisible: false,
    icon: "traceability",
  },
  {
    id: "unsafe-planned",
    label: "Planned",
    description: "A planned claim must not leak even if misconfigured.",
    status: "planned",
    productionVisible: true,
    icon: "trade-documentation",
  },
]

describe("getVisibleEvidence", () => {
  it("keeps the full evidence set outside production for design and test review", () => {
    expect(getVisibleEvidence(items, "development")).toEqual(items)
    expect(getVisibleEvidence(items, "test")).toEqual(items)
  })

  it("allows only explicitly production-visible verified evidence in production", () => {
    expect(getVisibleEvidence(items, "production")).toEqual([items[0]])
  })
})
