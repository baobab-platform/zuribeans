import { describe, expect, it } from "vitest"
import { getBuyerNavigation, getUnavailableBuyerSections } from "./capabilities"

describe("buyer capability boundaries", () => {
  it("fails closed when no authoritative capability snapshot exists", () => {
    expect(getBuyerNavigation(null)).toEqual([{ label: "Overview", href: "/account" }])
    expect(getUnavailableBuyerSections(null)).toHaveLength(5)
  })

  it("publishes navigation only for explicitly enabled capabilities", () => {
    expect(getBuyerNavigation({ organisation: true, catalogue: false })).toEqual([
      { label: "Overview", href: "/account" },
      { label: "Company", href: "/account/company" },
    ])
  })

  it("keeps disabled and missing capabilities unavailable", () => {
    const unavailable = getUnavailableBuyerSections({ orders: true, team: false })

    expect(unavailable.map(({ key }) => key)).toEqual([
      "organisation",
      "team",
      "catalogue",
      "documents",
    ])
  })
})
