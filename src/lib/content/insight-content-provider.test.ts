import { describe, expect, it } from "vitest"
import { FileInsightContentProvider } from "./insight-content-provider"
import type { InsightArticle } from "./insights"

const SOURCE: readonly InsightArticle[] = [
  {
    slug: "published",
    title: "Published",
    excerpt: "Public article.",
    body: ["Body."],
    category: "company-news",
    marketKeys: null,
    publishedAt: "2026-09-20",
    authorName: "Editorial",
    status: "published",
    canonicalContentId: "content-1",
  },
  {
    slug: "draft",
    title: "Draft",
    excerpt: "Private draft.",
    body: ["Body."],
    category: "company-news",
    marketKeys: null,
    publishedAt: "2026-09-21",
    authorName: "Editorial",
    status: "draft",
    canonicalContentId: "content-2",
  },
]

describe("FileInsightContentProvider", () => {
  const provider = new FileInsightContentProvider(SOURCE)

  it("implements the public read boundary without exposing drafts", async () => {
    await expect(provider.listPublished({ marketKey: "zuribeans_za" })).resolves.toEqual([
      expect.objectContaining({ slug: "published" }),
    ])
    await expect(provider.getPublishedBySlug("draft", "zuribeans_za")).resolves.toBeUndefined()
  })

  it("provides category and sitemap projections through the same boundary", async () => {
    await expect(provider.listCategoriesInUse("zuribeans_ug")).resolves.toEqual(["company-news"])
    await expect(provider.listSitemapEligibleSlugs()).resolves.toEqual(["published"])
  })
})
