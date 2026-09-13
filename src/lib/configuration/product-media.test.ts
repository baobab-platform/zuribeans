import { describe, expect, it } from "vitest"
import { getAllowedProductMediaOrigins, normalizeProductMediaUrl } from "./product-media"

describe("product media configuration", () => {
  it("deduplicates valid configured HTTP origins", () => {
    const origins = getAllowedProductMediaOrigins({
      MEDUSA_BACKEND_URL: "http://localhost:9000/store",
      PRODUCT_MEDIA_ORIGINS: "https://media.example.com, https://media.example.com/products",
    })
    expect(origins.map((url) => url.origin)).toEqual([
      "http://localhost:9000",
      "https://media.example.com",
    ])
  })

  it("keeps local media and rejects unconfigured remote media", () => {
    const allowed = [new URL("https://media.example.com")]
    expect(normalizeProductMediaUrl("/images/product.webp", allowed)).toBe("/images/product.webp")
    expect(normalizeProductMediaUrl("https://media.example.com/lot.webp", allowed)).toBe(
      "https://media.example.com/lot.webp",
    )
    expect(normalizeProductMediaUrl("https://untrusted.example/lot.webp", allowed)).toBeNull()
  })
})
