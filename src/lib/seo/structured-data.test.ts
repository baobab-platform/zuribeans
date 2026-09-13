import { describe, expect, it } from "vitest"
import { getOrganizationStructuredData, serializeStructuredData } from "./structured-data"

describe("structured data", () => {
  it("escapes markup before embedding JSON in a script element", () => {
    const serialized = serializeStructuredData({ name: "</script><script>alert(1)</script>" })

    expect(serialized).not.toContain("<")
    expect(JSON.parse(serialized)).toEqual({ name: "</script><script>alert(1)</script>" })
  })

  it("publishes only established organization and initial-market facts", () => {
    const data = getOrganizationStructuredData(new URL("https://zuribeans.example"))

    expect(data.url).toBe("https://zuribeans.example/")
    expect(data.areaServed.map(({ name }) => name)).toEqual(["Uganda", "South Africa"])
    expect(data).not.toHaveProperty("address")
    expect(data).not.toHaveProperty("contactPoint")
  })
})
