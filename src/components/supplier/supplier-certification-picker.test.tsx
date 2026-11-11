import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SupplierCertificationPicker } from "./supplier-certification-picker"

afterEach(() => cleanup())

describe("Figma Make supplier certification chooser", () => {
  it("shows all seven selection cards and an explicit first-time option", () => {
    render(<SupplierCertificationPicker />)
    for (const name of [
      "UTZ / Rainforest Alliance",
      "Organic (EU)",
      "Organic (NOP)",
      "Fair Trade",
      "GlobalG.A.P",
      "ISO 22000",
      "FSSC 22000",
      "None — applying for first time",
    ]) {
      expect(screen.getByRole("checkbox", { name })).toBeInTheDocument()
    }
  })

  it("preserves the indexed server payload and caps the currently supported three certificates", () => {
    const { container } = render(
      <form>
        <SupplierCertificationPicker />
      </form>,
    )
    for (const name of ["Organic (EU)", "ISO 22000", "Fair Trade"]) {
      fireEvent.click(screen.getByRole("checkbox", { name }))
    }
    expect(screen.getByRole("checkbox", { name: "FSSC 22000" })).toBeDisabled()
    const form = container.querySelector("form")
    expect(form).not.toBeNull()
    const data = new FormData(form!)
    expect(data.getAll("certification_type")).toEqual(["Organic (EU)", "ISO 22000", "Fair Trade"])
    expect(data.getAll("certification_issuer")).toHaveLength(3)
    expect(data.getAll("certification_reference")).toHaveLength(3)
    expect(data.getAll("certification_issued_on")).toHaveLength(3)
    expect(data.getAll("certification_expires_on")).toHaveLength(3)
  })

  it("clearing certifications does not submit a literal none-as-certificate record", () => {
    const { container } = render(
      <form>
        <SupplierCertificationPicker initial={[{ certificationType: "Organic (EU)" }]} />
      </form>,
    )
    fireEvent.click(screen.getByRole("checkbox", { name: "None — applying for first time" }))
    expect(screen.getByRole("checkbox", { name: "Organic (EU)" })).not.toBeChecked()
    const values = new FormData(container.querySelector("form")!).getAll("certification_type")
    expect(values).toEqual(["", "", ""])
  })
})
