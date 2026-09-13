import { describe, expect, it } from "vitest"
import { getPublicPageMetadata } from "./metadata"

describe("public page metadata", () => {
  it("keeps canonical and Open Graph URLs aligned", () => {
    const metadata = getPublicPageMetadata({
      title: "Trade",
      description: "A route description.",
      path: "/trade",
    })

    expect(metadata.alternates).toEqual({ canonical: "/trade" })
    expect(metadata.openGraph).toEqual(expect.objectContaining({ url: "/trade", title: "Trade" }))
  })
})
