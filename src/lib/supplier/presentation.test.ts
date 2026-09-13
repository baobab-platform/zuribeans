import { describe, expect, it } from "vitest"
import type { SupplierStatus } from "./lifecycle"
import { getSupplierStatusPresentation } from "./presentation"

describe("supplier status presentation", () => {
  it("provides a complete presentation for every lifecycle state", () => {
    const statuses: SupplierStatus[] = [
      "draft",
      "submitted",
      "under_review",
      "more_information_required",
      "sample_required",
      "qualification",
      "approved",
      "rejected",
      "active",
      "suspended",
      "offboarded",
    ]

    for (const status of statuses) {
      expect(getSupplierStatusPresentation(status)).toEqual(
        expect.objectContaining({
          label: expect.any(String),
          description: expect.any(String),
          tone: expect.any(String),
        }),
      )
    }
  })

  it("distinguishes declared review from supplier activation", () => {
    expect(getSupplierStatusPresentation("submitted").tone).toBe("info")
    expect(getSupplierStatusPresentation("active").tone).toBe("success")
  })
})
