import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SupplierApplicationJourney, SUPPLIER_STEPS } from "./supplier-application-journey"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const sections = [
  <div key="business"><h2>Business Details</h2><input name="legalName" defaultValue="Example Collective" required /><input name="countryCode" defaultValue="UG" required /></div>,
  <div key="contact"><h2>Primary Contact</h2><input name="contactName" defaultValue="Test Supplier" required /><input name="contactEmail" defaultValue="supplier@example.invalid" type="email" required /></div>,
  <div key="products"><h2>Products & Capacity</h2><input name="capability_category" defaultValue="coffee" /></div>,
  <div key="origin"><h2>Origin & Seasonality</h2><input name="capability_origin_country" defaultValue="UG" /><input name="capability_season" defaultValue="October–January" /></div>,
  <div key="certifications"><h2>Certifications</h2><input name="certification_type" defaultValue="Organic (EU)" /></div>,
]

describe("Figma Make supplier application journey", () => {
  it("preserves the six source steps and disables commits in development preview", () => {
    expect(SUPPLIER_STEPS).toHaveLength(6)
    vi.stubGlobal("scrollTo", vi.fn())
    render(<SupplierApplicationJourney preview sections={sections} />)
    expect(screen.getByRole("heading", { name: "Supplier Application" })).toBeInTheDocument()
    for (let index = 1; index < SUPPLIER_STEPS.length; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: /continue:/i }))
    }
    expect(screen.getByRole("heading", { name: "Review & Submit" })).toBeInTheDocument()
    expect(screen.getByText("Example Collective")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /preview only/i })).toBeDisabled()
  })

  it("blocks the next step when a required first-party country is absent", () => {
    render(<SupplierApplicationJourney preview sections={[<input key="country" name="countryCode" />, ...sections.slice(1)]} />)
    fireEvent.click(screen.getByRole("button", { name: /continue:/i }))
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Select the country where your organisation is registered.",
    )
    expect(screen.getByRole("heading", { name: "Review & Submit", hidden: true })).not.toBeVisible()
  })

  it("cannot advance without a declared product category", () => {
    vi.stubGlobal("scrollTo", vi.fn())
    render(<SupplierApplicationJourney preview sections={[...sections.slice(0, 2), <div key="none">No products entered</div>, ...sections.slice(3)]} />)
    fireEvent.click(screen.getByRole("button", { name: /continue:/i }))
    fireEvent.click(screen.getByRole("button", { name: /continue:/i }))
    fireEvent.click(screen.getByRole("button", { name: /continue:/i }))
    expect(screen.getByRole("alert")).toHaveTextContent("Select at least one product category")
  })
})
