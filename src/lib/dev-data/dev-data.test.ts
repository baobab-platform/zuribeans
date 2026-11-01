import { describe, expect, it } from "vitest"
import {
  DEMO_CORRIDORS,
  DEMO_HS2022,
  DEMO_MARKETS,
  DEMO_PRODUCTS,
  DEMO_PRODUCT_CATEGORIES,
  getDemoProduct,
  listDemoProducts,
} from "./catalogue"
import { isSyntheticExperienceEnabled } from "./enablement"
import { DEMO_INSIGHTS } from "./insights"
import { DEMO_DOCUMENT_KINDS, DEMO_LOTS, DEMO_SUPPLIERS } from "./operations"
import { DEMO_SUPPLIER_JOURNEYS } from "./supplier-journeys"
import { FileInsightContentProvider } from "@/lib/content/insight-content-provider"

describe("ZB-DEV-DATA v1.0", () => {
  it("only activates with explicit local development opt-in", () => {
    expect(
      isSyntheticExperienceEnabled({ NODE_ENV: "development", ZB_DEV_DATA_MODE: "synthetic" }),
    ).toBe(true)
    expect(
      isSyntheticExperienceEnabled({ NODE_ENV: "production", ZB_DEV_DATA_MODE: "synthetic" }),
    ).toBe(false)
    expect(isSyntheticExperienceEnabled({ NODE_ENV: "test", ZB_DEV_DATA_MODE: "synthetic" })).toBe(
      false,
    )
    expect(isSyntheticExperienceEnabled({ NODE_ENV: "development" })).toBe(false)
  })

  it("contains five bidirectional markets and all 20 directed corridors", () => {
    expect(DEMO_MARKETS.map((market) => market.code).sort()).toEqual(["ET", "KE", "TZ", "UG", "ZA"])
    expect(new Set(DEMO_MARKETS.map((market) => market.marketKey)).size).toBe(5)
    expect(DEMO_CORRIDORS).toHaveLength(20)
    expect(new Set(DEMO_CORRIDORS.map((corridor) => corridor.id)).size).toBe(20)
    for (const lane of DEMO_CORRIDORS) {
      expect(lane.origin).not.toBe(lane.destination)
      expect(
        DEMO_CORRIDORS.some(
          (reverse) => reverse.origin === lane.destination && reverse.destination === lane.origin,
        ),
      ).toBe(true)
      expect(lane.status).toBe("illustrative-unqualified")
      expect(lane.customsDecision).toBeNull()
      expect(lane.tariffRate).toBeNull()
    }
  })

  it("provides unique graded commodities using HS 2022 six-digit classification", () => {
    expect(DEMO_PRODUCTS.length).toBeGreaterThanOrEqual(60)
    expect(new Set(DEMO_PRODUCTS.map((product) => product.id)).size).toBe(DEMO_PRODUCTS.length)
    expect(new Set(DEMO_PRODUCTS.map((product) => product.handle)).size).toBe(DEMO_PRODUCTS.length)
    expect(new Set(DEMO_PRODUCTS.map((product) => product.originCountry)).size).toBe(5)
    for (const family of ["coffee", "vanilla", "sorghum", "related"]) {
      expect(DEMO_PRODUCTS.some((product) => product.categoryHandle === family)).toBe(true)
    }
    for (const product of DEMO_PRODUCTS) {
      expect(DEMO_HS2022[product.hs6]).toBeTruthy()
      expect(product.hs6).toMatch(/^[0-9]{6}$/)
      expect(product.fixture).toBe(true)
      expect(product.fixtureVersion).toBe("ZB-DEV-DATA-1.0")
      expect(product.quotation).toBeNull()
      expect(product.inventoryAuthority).toBeNull()
      expect(product.supplierPrincipal).toBeNull()
      expect(product.tariffNationalExtension).toBeNull()
      expect(product.destinationMarkets).not.toContain(product.originCountry)
    }
  })

  it("supports category, text, HS code, paging and detail lookup deterministically", () => {
    expect(DEMO_PRODUCT_CATEGORIES).toHaveLength(4)
    const all = listDemoProducts({ limit: 12, offset: 0 })
    expect(all.items).toHaveLength(12)
    expect(all.count).toBe(DEMO_PRODUCTS.length)
    const page2 = listDemoProducts({ limit: 12, offset: 12 })
    expect(page2.items[0].id).toBe(DEMO_PRODUCTS[12].id)
    const coffeeId = DEMO_PRODUCT_CATEGORIES.find((category) => category.handle === "coffee")!.id
    expect(
      listDemoProducts({ categoryId: coffeeId }).items.every(
        (item) =>
          DEMO_PRODUCTS.find((product) => product.id === item.id)?.categoryHandle === "coffee",
      ),
    ).toBe(true)
    expect(listDemoProducts({ query: "090520" }).items.length).toBeGreaterThan(0)
    expect(listDemoProducts({ categoryId: "unknown" }).count).toBe(0)
    expect(getDemoProduct(DEMO_PRODUCTS[0].handle)?.id).toBe(DEMO_PRODUCTS[0].id)
    expect(getDemoProduct("not-a-product")).toBeNull()
  })

  it("has twenty preview-only insights and does not leak to the real file provider", async () => {
    expect(DEMO_INSIGHTS).toHaveLength(20)
    expect(new Set(DEMO_INSIGHTS.map((article) => article.slug)).size).toBe(20)
    const provider = new FileInsightContentProvider(DEMO_INSIGHTS)
    expect((await provider.listPublished({ marketKey: "zuribeans_za" })).length).toBe(20)
    expect(await provider.getPublishedBySlug(DEMO_INSIGHTS[0].slug, "zuribeans_ug")).toBeDefined()
    expect(DEMO_INSIGHTS.every((article) => article.canonicalContentId === null)).toBe(true)
  })

  it("keeps suppliers, lots and documents intentionally non-authoritative", () => {
    expect(DEMO_SUPPLIERS).toHaveLength(10)
    expect(DEMO_LOTS).toHaveLength(25)
    expect(DEMO_DOCUMENT_KINDS).toHaveLength(9)
    expect(
      DEMO_SUPPLIERS.every(
        (supplier) => supplier.principalId === null && supplier.legalEntityId === null,
      ),
    ).toBe(true)
    expect(
      DEMO_LOTS.every(
        (lot) =>
          lot.state === "illustrative" && lot.events.every((event) => event.evidence === null),
      ),
    ).toBe(true)
    expect(DEMO_DOCUMENT_KINDS.every((doc) => doc.authority === "unverified-per-corridor")).toBe(
      true,
    )
  })
  it("fills every synthetic PDP with traceability, certifications, documents and shipping terms", () => {
    for (const product of DEMO_PRODUCTS) {
      const dossier = product.dossier
      expect(dossier).toBeDefined()
      expect(dossier?.provenance.length).toBeGreaterThanOrEqual(6)
      expect(dossier?.quality.length).toBeGreaterThanOrEqual(5)
      expect(dossier?.certifications.length).toBeGreaterThanOrEqual(3)
      expect(dossier?.documents.length).toBeGreaterThanOrEqual(5)
      expect(dossier?.terms?.incoterms).toEqual(["EXW", "FOB", "CIF"])
      expect(dossier?.terms?.availableQuantity).toMatch(/metric tonnes/)
      expect(dossier?.terms?.supplyStatus).toBeTruthy()
      expect(dossier?.terms?.shippingLeadTime).toMatch(/days/)
      expect(dossier?.terms?.destinationMarkets).toHaveLength(4)
      expect(dossier?.documents.every((doc) => !("downloadUrl" in doc))).toBe(true)
      expect(dossier?.certifications.every((cert) => cert.certificateId.startsWith("SYN-"))).toBe(
        true,
      )
      expect(dossier?.documents.every((doc) => doc.reference.startsWith("SYN-"))).toBe(true)
    }
  })
  it("provides distinct, source-isolated supplier journeys for every preview market", () => {
    expect(DEMO_SUPPLIER_JOURNEYS).toHaveLength(DEMO_SUPPLIERS.length)
    expect(new Set(DEMO_SUPPLIER_JOURNEYS.map((record) => record.id)).size).toBe(
      DEMO_SUPPLIER_JOURNEYS.length,
    )
    expect(new Set(DEMO_SUPPLIER_JOURNEYS.map((record) => record.country)).size).toBe(5)
    for (const supplier of DEMO_SUPPLIER_JOURNEYS) {
      const source = DEMO_SUPPLIERS.find((item) => item.id === supplier.id)
      expect(source?.principalId).toBeNull()
      expect(source?.legalEntityId).toBeNull()
      expect(supplier.form.legalName).toBe(source?.label)
      expect(supplier.form.contactEmail).toMatch(/@example\.invalid$/)
      expect(supplier.certificationStatus).toBe("unverified-fixture")
      expect(supplier.documents.every((document) => document.reference.startsWith("SYN-"))).toBe(
        true,
      )
    }
  })
})
