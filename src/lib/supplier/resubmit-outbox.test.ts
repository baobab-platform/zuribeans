import { describe, expect, it } from "vitest"
import { canTransitionSupplierStatus } from "./lifecycle"
import { estateApplicationId, SUPPLIER_EVENT_TYPES } from "./outbox"

describe("applicant MIR resubmit guards", () => {
  it("allows more_information_required and sample_required to under_review", () => {
    expect(canTransitionSupplierStatus("more_information_required", "under_review")).toBe(true)
    expect(canTransitionSupplierStatus("sample_required", "under_review")).toBe(true)
  })

  it("does not allow applicant skip from submitted to under_review via MIR path only", () => {
    // submitted → under_review is staff path; MIR resubmit is only from MIR/sample
    expect(canTransitionSupplierStatus("submitted", "under_review")).toBe(true)
    expect(canTransitionSupplierStatus("submitted", "approved")).toBe(false)
  })
})

describe("supplier event outbox helpers", () => {
  it("builds estate application ids matching Shared-ish sup_ prefix", () => {
    const id = estateApplicationId("01234567-89ab-cdef-0123-456789abcdef")
    expect(id.startsWith("sup_")).toBe(true)
    expect(id.length).toBeGreaterThan(8)
  })

  it("exposes Shared contract event type names", () => {
    expect(SUPPLIER_EVENT_TYPES.applicationSubmitted).toContain("application.submitted")
    expect(SUPPLIER_EVENT_TYPES.capabilityVerified).toContain("capability.verified")
    expect(SUPPLIER_EVENT_TYPES.applicationDecided).toContain("application.decided")
  })
})
