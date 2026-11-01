import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CatalogueTile } from "./catalogue-tile"

describe("Figma-inspired catalogue tile", () => {
  it("shows only sourced product details and a usable product link", () => {
    render(
      <CatalogueTile
        href="/products/arabica-aa"
        title="Arabica AA"
        eyebrow="Published catalogue"
        origin="Eastern Uganda"
        details="Washed"
        actionLabel="View"
      />,
    )
    expect(screen.getByRole("link", { name: "View: Arabica AA" })).toHaveAttribute(
      "href",
      "/products/arabica-aa",
    )
    expect(screen.getByText("Eastern Uganda")).toBeInTheDocument()
    expect(screen.getByText("Washed")).toBeInTheDocument()
    expect(screen.queryByText(/ISO|available|grade certified/i)).toBeNull()
  })

  it("reproduces synthetic grade, process, certification, availability and terms without claiming verification", () => {
    render(
      <CatalogueTile
        href="/products/demo-robusta-faq-ug"
        title="Robusta Coffee"
        eyebrow="Coffee"
        origin="Western Uganda"
        cardFacts={{
          source: "synthetic",
          category: "Coffee",
          grade: "Screen 15+, FAQ",
          process: "Natural / Sun-dried",
          certification: "UTZ / RA (sample)",
          supplyStatus: "Available",
          minimumOrder: "1,200 kg",
          incoterms: "FOB / CIF",
        }}
      />,
    )
    expect(screen.getByText("Sample data")).toBeInTheDocument()
    expect(screen.getByText("Screen 15+, FAQ")).toBeInTheDocument()
    expect(screen.getByText("Natural / Sun-dried")).toBeInTheDocument()
    expect(screen.getByText(/UTZ \/ RA \(sample\)/)).toBeInTheDocument()
    expect(screen.getByText("Available (sample)")).toBeInTheDocument()
    expect(screen.getByText(/Illustrative terms: MOQ 1,200 kg/)).toBeInTheDocument()
  })

  it("does not invent a certificate, grade or availability if metadata is absent", () => {
    render(<CatalogueTile href="/products/unknown" title="Published product" eyebrow="Catalogue" />)
    expect(screen.getByText("Origin details on request")).toBeInTheDocument()
    expect(screen.queryByText("Details")).toBeNull()
    expect(screen.queryByText("Available")).toBeNull()
  })
})
