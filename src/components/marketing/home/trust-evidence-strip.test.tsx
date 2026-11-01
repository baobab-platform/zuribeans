import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TrustEvidenceStrip } from "./trust-evidence-strip"
import { TRUST_EVIDENCE } from "@/lib/content/homepage"
import { getVisibleEvidence } from "@/lib/content/evidence"
import { DEMO_TRUST_EVIDENCE } from "@/lib/dev-data/trust-evidence"

describe("Figma-inspired trade assurance strip", () => {
  it("renders only provided governed evidence, in order", () => {
    const evidence = getVisibleEvidence(TRUST_EVIDENCE, "production")
    const { container } = render(<TrustEvidenceStrip items={evidence} />)
    expect(screen.getByRole("region", { name: "Trade assurance" })).toBeInTheDocument()
    expect(container.querySelectorAll("li")).toHaveLength(evidence.length)
    evidence.forEach(({ label, description }) => {
      expect(screen.getByText(label)).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
    })
    expect(container.textContent).not.toMatch(/ISO 22000|EUDR Ready|C\\.O\\.D Capable/)
  })

  it("renders six labelled Figma specimens in preview but none as production evidence", () => {
    expect(DEMO_TRUST_EVIDENCE).toHaveLength(6)
    expect(getVisibleEvidence(DEMO_TRUST_EVIDENCE, "production")).toHaveLength(0)
    const { getByText } = render(<TrustEvidenceStrip items={DEMO_TRUST_EVIDENCE} />)
    expect(getByText("ISO 22000")).toBeInTheDocument()
    expect(getByText("EUDR Ready")).toBeInTheDocument()
    expect(getByText("C.O.D Capable")).toBeInTheDocument()
    expect(getByText("Sample · food safety")).toBeInTheDocument()
    expect(getByText("Sample · payment terms")).toBeInTheDocument()
  })

  it("does not manufacture assurance claims when evidence is absent", () => {
    const { container } = render(<TrustEvidenceStrip items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
