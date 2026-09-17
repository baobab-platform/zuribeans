import { beforeEach, describe, expect, it, vi } from "vitest"

const { setSupplierCanonicalOrganisationId } = vi.hoisted(() => ({
  setSupplierCanonicalOrganisationId: vi.fn(),
}))

vi.mock("@/lib/supplier/repository", () => ({ setSupplierCanonicalOrganisationId }))
vi.mock("@/lib/configuration/environment", () => ({
  getSupplierAdminEnvironment: () => ({ SUPPLIER_ADMIN_API_KEY: "a".repeat(32) }),
}))

import { POST } from "./route"

const validApiKey = "a".repeat(32)

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost:3000/api/admin/suppliers/sup-1/canonical-link", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: "sup-1" }) },
  )

describe("POST /api/admin/suppliers/[id]/canonical-link", () => {
  beforeEach(() => {
    setSupplierCanonicalOrganisationId.mockReset()
  })

  it("rejects a request with no Authorization header", async () => {
    const response = await post({ canonical_organisation_id: "canon-1" })
    expect(response.status).toBe(401)
    expect(setSupplierCanonicalOrganisationId).not.toHaveBeenCalled()
  })

  it("rejects a request with the wrong API key", async () => {
    const response = await post(
      { canonical_organisation_id: "canon-1" },
      { authorization: "Bearer wrong-key" },
    )
    expect(response.status).toBe(401)
  })

  it("rejects an invalid body", async () => {
    const response = await post({}, { authorization: `Bearer ${validApiKey}` })
    expect(response.status).toBe(400)
    expect(setSupplierCanonicalOrganisationId).not.toHaveBeenCalled()
  })

  it("rejects a malformed JSON body", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/suppliers/sup-1/canonical-link", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${validApiKey}` },
        body: "not json",
      }),
      { params: Promise.resolve({ id: "sup-1" }) },
    )
    expect(response.status).toBe(400)
  })

  it("returns 404 when the supplier organisation does not exist", async () => {
    setSupplierCanonicalOrganisationId.mockResolvedValue(null)
    const response = await post(
      { canonical_organisation_id: "canon-1" },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(404)
  })

  it("sets the canonical organisation id and returns it", async () => {
    setSupplierCanonicalOrganisationId.mockResolvedValue({
      id: "sup-1",
      canonicalOrganisationId: "canon-1",
    })
    const response = await post(
      { canonical_organisation_id: "canon-1" },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: "sup-1", canonical_organisation_id: "canon-1" })
    expect(setSupplierCanonicalOrganisationId).toHaveBeenCalledWith("sup-1", "canon-1")
  })
})
