import { describe, expect, it } from "vitest"
import { QUALITY_EVIDENCE_ITEMS } from "@/lib/content/quality"

describe("quality evidence content", () => {
  it("keeps evidence states explicit and ordered", () => {
    expect(QUALITY_EVIDENCE_ITEMS.map(({ number }) => number)).toEqual(["01", "02", "03", "04"])
    expect(QUALITY_EVIDENCE_ITEMS.map(({ icon }) => icon)).toEqual([
      "context",
      "verification",
      "documentation",
      "access",
    ])
  })

  it("does not present declarations as certification claims", () => {
    const copy = QUALITY_EVIDENCE_ITEMS.map(({ detail }) => detail)
      .join(" ")
      .toLowerCase()

    expect(copy).toContain("declared")
    expect(copy).not.toContain("certified")
  })
})
