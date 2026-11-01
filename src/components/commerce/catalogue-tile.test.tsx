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

  it("does not invent a certificate, grade or availability if metadata is absent", () => {
    render(
      <CatalogueTile
        href="/products/unknown"
        title="Published product"
        eyebrow="Catalogue"
      />,
    )
    expect(screen.getByText("Origin details on request")).toBeInTheDocument()
    expect(screen.queryByText("Details")).toBeNull()
    expect(screen.queryByText("Available")).toBeNull()
  })
})
