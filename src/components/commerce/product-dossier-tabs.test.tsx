import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { DEMO_PRODUCTS } from "@/lib/dev-data/catalogue"
import { ProductDossierTabs } from "./product-dossier-tabs"

afterEach(() => cleanup())

describe("Figma Make product dossier tabs", () => {
  const product = DEMO_PRODUCTS[0]

  it("renders complete synthetic specifications, while keeping real-product fallback separate", () => {
    render(<ProductDossierTabs product={product} />)
    expect(screen.getByRole("tab", { name: "Specifications" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(screen.getByText("HS 2022 (6 digits)")).toBeInTheDocument()
    expect(screen.getAllByText("Grade").length).toBeGreaterThan(0)
    expect(product.dossier?.certifications.length).toBeGreaterThan(0)
  })

  it("switches through provenance, quality and evidence with keyboard navigation", () => {
    render(<ProductDossierTabs product={product} />)
    const provenance = screen.getByRole("tab", { name: "Provenance" })
    const quality = screen.getByRole("tab", { name: "Quality" })
    const evidence = screen.getByRole("tab", { name: "Evidence & Docs" })
    fireEvent.click(provenance)
    expect(screen.getByRole("tabpanel", { name: "Provenance" })).toHaveTextContent("Producer")
    fireEvent.keyDown(provenance, { key: "ArrowRight" })
    expect(quality).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tabpanel", { name: "Quality" })).toHaveTextContent("Moisture")
    fireEvent.click(evidence)
    const panel = screen.getByRole("tabpanel", { name: "Evidence & Docs" })
    expect(panel).toHaveTextContent("Organic (EU)")
    expect(panel).toHaveTextContent("UTZ Certified")
    expect(panel).toHaveTextContent("ISO 22000")
    expect(panel).toHaveTextContent("Phytosanitary certificate")
    expect(panel).toHaveTextContent("Document register")
    expect(screen.queryByRole("button", { name: /download/i })).not.toBeInTheDocument()
  })

  it("does not generate certificates from a real product with no documented dossier", () => {
    render(
      <ProductDossierTabs
        product={{
          ...product,
          dossier: undefined,
          certifications: [],
          specifications: [{ label: "Processing method", value: "Washed" }],
          qualityInformation: null,
        }}
      />,
    )
    fireEvent.click(screen.getByRole("tab", { name: "Evidence & Docs" }))
    expect(screen.getByRole("tabpanel", { name: "Evidence & Docs" })).toHaveTextContent(
      "No certification records are published",
    )
    expect(screen.queryByText("ISO 22000")).not.toBeInTheDocument()
  })
})
