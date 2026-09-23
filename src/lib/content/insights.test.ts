import { describe, expect, it } from "vitest"
import {
  getPublishedInsightBySlug,
  listInsightCategoriesInUse,
  listPublishedInsights,
  listSitemapEligibleInsightSlugs,
  type InsightArticle,
} from "./insights"

const FIXTURES: readonly InsightArticle[] = [
  {
    slug: "global-published",
    title: "Global published",
    excerpt: "Relevant everywhere.",
    body: ["Body."],
    category: "company-news",
    marketKeys: null,
    publishedAt: "2026-09-01",
    authorName: "Editorial",
    status: "published",
    canonicalContentId: null,
  },
  {
    slug: "ug-only-published",
    title: "Uganda only, published",
    excerpt: "Scoped to Uganda.",
    body: ["Body."],
    category: "sourcing",
    marketKeys: ["zuribeans_ug"],
    publishedAt: "2026-09-15",
    authorName: "Editorial",
    status: "published",
    canonicalContentId: null,
  },
  {
    slug: "za-only-draft",
    title: "South Africa only, still a draft",
    excerpt: "Not ready.",
    body: ["Body."],
    category: "trade-logistics",
    marketKeys: ["zuribeans_za"],
    publishedAt: "2026-09-20",
    authorName: "Editorial",
    status: "draft",
    canonicalContentId: null,
  },
] as const

describe("listPublishedInsights", () => {
  it("never returns a draft article", () => {
    const results = listPublishedInsights({ marketKey: "zuribeans_za" }, FIXTURES)
    expect(results.some((article) => article.status === "draft")).toBe(false)
  })

  it("includes market-scoped articles only for their own market", () => {
    const ug = listPublishedInsights({ marketKey: "zuribeans_ug" }, FIXTURES).map((a) => a.slug)
    const za = listPublishedInsights({ marketKey: "zuribeans_za" }, FIXTURES).map((a) => a.slug)

    expect(ug).toContain("ug-only-published")
    expect(za).not.toContain("ug-only-published")
  })

  it("always includes a global (market-independent) article", () => {
    const za = listPublishedInsights({ marketKey: "zuribeans_za" }, FIXTURES).map((a) => a.slug)
    expect(za).toContain("global-published")
  })

  it("orders newest first", () => {
    const results = listPublishedInsights({ marketKey: "zuribeans_ug" }, FIXTURES)
    const dates = results.map((article) => article.publishedAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it("narrows by category when provided", () => {
    const results = listPublishedInsights(
      { marketKey: "zuribeans_ug", category: "sourcing" },
      FIXTURES,
    )
    expect(results.map((a) => a.slug)).toEqual(["ug-only-published"])
  })
})

describe("getPublishedInsightBySlug", () => {
  it("returns a published, market-visible article", () => {
    expect(getPublishedInsightBySlug("global-published", "zuribeans_za", FIXTURES)?.slug).toBe(
      "global-published",
    )
  })

  it("treats a draft article as not found, never leaking it publicly", () => {
    expect(getPublishedInsightBySlug("za-only-draft", "zuribeans_za", FIXTURES)).toBeUndefined()
  })

  it("treats an out-of-market article as not found for a different market", () => {
    expect(
      getPublishedInsightBySlug("ug-only-published", "zuribeans_za", FIXTURES),
    ).toBeUndefined()
  })
})

describe("listInsightCategoriesInUse", () => {
  it("only surfaces categories with a published, market-visible article", () => {
    expect(listInsightCategoriesInUse("zuribeans_za", FIXTURES)).toEqual(["company-news"])
    expect(listInsightCategoriesInUse("zuribeans_ug", FIXTURES)).toEqual(
      expect.arrayContaining(["company-news", "sourcing"]),
    )
  })
})

describe("listSitemapEligibleInsightSlugs", () => {
  it("includes only published articles that are globally visible", () => {
    expect(listSitemapEligibleInsightSlugs(FIXTURES)).toEqual(["global-published"])
  })

  it("excludes published market-scoped articles until market-segmented canonical URLs exist", () => {
    expect(listSitemapEligibleInsightSlugs(FIXTURES)).not.toContain("ug-only-published")
  })

  it("excludes draft articles", () => {
    expect(listSitemapEligibleInsightSlugs(FIXTURES)).not.toContain("za-only-draft")
  })
})

describe("real editorial content (src/lib/content/insights.ts)", () => {
  it("keeps the two seed topic drafts unpublished until reviewed copy replaces them", () => {
    expect(
      getPublishedInsightBySlug("reading-a-uganda-harvest-report-as-a-buyer", "zuribeans_ug"),
    ).toBeUndefined()
    expect(
      getPublishedInsightBySlug("what-changed-in-sars-import-vat-handling", "zuribeans_za"),
    ).toBeUndefined()
  })

  it("publishes the launch announcement for every market", () => {
    expect(
      getPublishedInsightBySlug("introducing-zuribeans-insights", "zuribeans_za"),
    ).toBeDefined()
    expect(
      getPublishedInsightBySlug("introducing-zuribeans-insights", "zuribeans_ug"),
    ).toBeDefined()
  })
})
