import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  status: vi.fn(),
  project: vi.fn(),
  configured: vi.fn(),
}))
vi.mock("@/lib/supplier/repository", () => ({
  getSupplierApplicationById: mocks.detail,
  setErpProjectionStatus: mocks.status,
}))
vi.mock("@/lib/erp/business-partner-client", async (original) => ({
  ...(await original<typeof import("@/lib/erp/business-partner-client")>()),
  projectSupplierBusinessPartner: mocks.project,
  isErpProjectionConfigured: mocks.configured,
}))
import { requestErpBusinessPartnerProjection } from "./erp-projection"

describe("supplier ERP receipt disposition", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.detail.mockResolvedValue({
      organisation: {
        id: "supplier-1",
        erpProjectionStatus: "READY",
        status: "approved",
        canonicalOrganisationId: "canonical-1",
        legalName: "Synthetic supplier",
        countryCode: "UG",
      },
    })
    mocks.configured.mockReturnValue(true)
    mocks.status.mockResolvedValue({})
  })
  afterEach(() => vi.restoreAllMocks())
  const execute = () =>
    requestErpBusinessPartnerProjection({
      supplierOrganisationId: "supplier-1",
      actor: "staff:synthetic",
    })

  it("preserves PENDING for an unknown outcome or invalid receipt instead of permitting a duplicate retry", async () => {
    for (const reason of ["outcome_unknown", "invalid_response"]) {
      mocks.status.mockClear()
      mocks.project.mockResolvedValue({ ok: false, reason, detail: "Reconciliation required." })
      expect(await execute()).toMatchObject({ ok: false, error: "erp_failed" })
      expect(mocks.status.mock.calls.map(([input]) => input.status)).toEqual(["PENDING"])
    }
  })
  it("records FAILED only for a known refusal", async () => {
    mocks.project.mockResolvedValue({ ok: false, reason: "http_error", detail: "Refused." })
    await execute()
    expect(mocks.status.mock.calls.map(([input]) => input.status)).toEqual(["PENDING", "FAILED"])
  })
  it("stores a public ERP identifier only after a valid receipt", async () => {
    mocks.project.mockResolvedValue({
      ok: true,
      projection: { business_partner_id: "erp_opaque123" },
    })
    expect(await execute()).toMatchObject({ ok: true, businessPartnerId: "erp_opaque123" })
    expect(mocks.status).toHaveBeenLastCalledWith({
      supplierOrganisationId: "supplier-1",
      status: "PROJECTED",
      actor: "staff:synthetic",
      erpBusinessPartnerId: "erp_opaque123",
    })
  })
  it("does not create a pending handoff when deployment configuration is absent", async () => {
    mocks.configured.mockReturnValue(false)
    expect(await execute()).toMatchObject({ ok: false, error: "erp_not_configured" })
    expect(mocks.project).not.toHaveBeenCalled()
    expect(mocks.status).not.toHaveBeenCalled()
  })

  it("does not contact ERP after losing the exclusive database claim or its source supplier", async () => {
    mocks.status.mockRejectedValue(new Error("claim already taken"))
    expect(await execute()).toMatchObject({ ok: false, error: "erp_failed" })
    expect(mocks.project).not.toHaveBeenCalled()
    mocks.status.mockResolvedValue(null)
    expect(await execute()).toMatchObject({ ok: false, error: "not_found" })
    expect(mocks.project).not.toHaveBeenCalled()
  })
})
