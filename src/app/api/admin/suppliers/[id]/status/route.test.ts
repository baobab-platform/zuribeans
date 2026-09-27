import { beforeEach, describe, expect, it, vi } from "vitest"

const { transitionSupplierStatus } = vi.hoisted(() => ({
  transitionSupplierStatus: vi.fn(),
}))

vi.mock("@/lib/supplier/repository", () => ({ transitionSupplierStatus }))
vi.mock("@/lib/configuration/environment", () => ({
  getSupplierAdminEnvironment: () => ({ SUPPLIER_ADMIN_API_KEY: "a".repeat(32) }),
}))

import { POST } from "./route"

const validApiKey = "a".repeat(32)

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost:3000/api/admin/suppliers/sup-1/status", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: "sup-1" }) },
  )

describe("POST /api/admin/suppliers/[id]/status", () => {
  beforeEach(() => {
    transitionSupplierStatus.mockReset()
  })

  it("rejects a request with no Authorization header", async () => {
    const response = await post({ status: "under_review", actor: "alice" })
    expect(response.status).toBe(401)
    expect(transitionSupplierStatus).not.toHaveBeenCalled()
  })

  it("rejects a request with the wrong API key", async () => {
    const response = await post(
      { status: "under_review", actor: "alice" },
      { authorization: "Bearer wrong-key" },
    )
    expect(response.status).toBe(401)
  })

  it("rejects an invalid body", async () => {
    const response = await post({}, { authorization: `Bearer ${validApiKey}` })
    expect(response.status).toBe(400)
    expect(transitionSupplierStatus).not.toHaveBeenCalled()
  })

  it("requires a reason or rejection code when rejecting", async () => {
    const response = await post(
      { status: "rejected", actor: "alice" },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ error: "rejection_requires_reason" })
    expect(transitionSupplierStatus).not.toHaveBeenCalled()
  })

  it("returns 409 when the lifecycle transition is illegal", async () => {
    transitionSupplierStatus.mockRejectedValue(
      new Error('Cannot transition a supplier application from "submitted" to "approved".'),
    )
    const response = await post(
      { status: "approved", actor: "alice" },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({ error: "invalid_transition" })
  })

  it("returns 404 when the application does not exist", async () => {
    transitionSupplierStatus.mockResolvedValue(null)
    const response = await post(
      { status: "under_review", actor: "alice" },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(404)
  })

  it("transitions status and prefixes the actor as staff", async () => {
    transitionSupplierStatus.mockResolvedValue({
      id: "sup-1",
      status: "under_review",
      updatedAt: new Date("2026-09-20T12:00:00.000Z"),
    })
    const response = await post(
      { status: "under_review", actor: "alice", reason: "Triage" },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      id: "sup-1",
      status: "under_review",
      updated_at: "2026-09-20T12:00:00.000Z",
    })
    expect(transitionSupplierStatus).toHaveBeenCalledWith({
      supplierOrganisationId: "sup-1",
      toStatus: "under_review",
      actor: "staff:alice",
      reason: "Triage",
    })
  })

  it("includes Shared rejection_reason_code in the event reason", async () => {
    transitionSupplierStatus.mockResolvedValue({
      id: "sup-1",
      status: "rejected",
      updatedAt: new Date("2026-09-20T12:00:00.000Z"),
    })
    const response = await post(
      {
        status: "rejected",
        actor: "alice",
        rejection_reason_code: "incomplete_documentation",
        reason: "Missing certs",
      },
      { authorization: `Bearer ${validApiKey}` },
    )
    expect(response.status).toBe(200)
    expect(transitionSupplierStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        toStatus: "rejected",
        reason: "rejection_reason_code=incomplete_documentation; Missing certs",
      }),
    )
  })
})
