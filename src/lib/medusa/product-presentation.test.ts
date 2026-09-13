import { describe, expect, it } from "vitest"
import { normalizeProductMetadata } from "./product-presentation"

describe("product presentation metadata", () => {
  it("normalizes only supported public fields", () => {
    expect(
      normalizeProductMetadata({
        grade: " Screen 18 ",
        processing_method: "Washed",
        certifications: ["Organic", "", 42],
        confidential_price: "100",
      }),
    ).toEqual({
      certifications: ["Organic"],
      qualityInformation: null,
      specifications: [
        { label: "Grade", value: "Screen 18" },
        { label: "Processing method", value: "Washed" },
      ],
    })
  })

  it("accepts a comma-separated certification list", () => {
    expect(
      normalizeProductMetadata({ certifications: "Organic, Rainforest Alliance" }).certifications,
    ).toEqual(["Organic", "Rainforest Alliance"])
  })
})
