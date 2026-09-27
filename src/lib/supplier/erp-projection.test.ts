import { describe, expect, it } from "vitest"
import { isPublicErpBusinessPartnerId } from "./erp-projection"

describe("isPublicErpBusinessPartnerId", () => {
  it("accepts Shared public form", () => {
    expect(isPublicErpBusinessPartnerId("erp_a1b2c3d4e5")).toBe(true)
  })

  it("rejects native-looking or empty ids", () => {
    expect(isPublicErpBusinessPartnerId("")).toBe(false)
    expect(isPublicErpBusinessPartnerId("12345")).toBe(false)
    expect(isPublicErpBusinessPartnerId("C_BPartner_99")).toBe(false)
    expect(isPublicErpBusinessPartnerId("erp_")).toBe(false)
    expect(isPublicErpBusinessPartnerId("ERP_abc")).toBe(false)
  })
})
