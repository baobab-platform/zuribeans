import type { ZuribeansMarketKey } from "@/lib/market/markets"
import { isInsightCategoryKey } from "./insights-categories"

export type InsightArticleStatus = "draft" | "published"

export type InsightArticle = {
  slug: string
  title: string
  /** One or two sentences shown on cards and used as the SEO/OG description fallback. */
  excerpt: string
  /** Plain paragraphs, rendered with `@tailwindcss/typography`. See ADR-0011 for why this is not MDX yet. */
  body: readonly string[]
  /** Key into `INSIGHT_CATEGORIES` — validated by `isInsightCategoryKey`, never a free string in routes. */
  category: string
  /**
   * `null` means relevant to every enabled market (company news, cross-market
   * explainers). A populated array scopes the article to those markets only.
   * See ADR-0011 — market scoping is content-level, not URL-level.
   */
  marketKeys: readonly ZuribeansMarketKey[] | null
  /** ISO 8601 date. Editorial cadence is bi-weekly; keep entries in descending order below. */
  publishedAt: string
  authorName: string
  status: InsightArticleStatus
  heroImage?: { src: string; alt: string }
  /**
   * Reserved for the future CMS engine (Payload CMS, platform Gate ZB-18).
   * Never populated by this file-based increment — see ADR-0011.
   */
  canonicalContentId: string | null
}

/**
 * Editorial content lives here as a reviewed pull request, the same
 * convention as every other page's copy in this repo (`trade.ts`,
 * `quality.ts`, `homepage.ts`). Flip an entry's `status` to `"published"`
 * once real, reviewed copy replaces placeholder text — draft entries never
 * resolve on a public route or appear in the sitemap (see ADR-0011).
 */
export const INSIGHT_ARTICLES: readonly InsightArticle[] = [
  {
    slug: "introducing-zuribeans-insights",
    title: "Introducing ZuriBeans Insights",
    excerpt:
      "A new bi-weekly series of sourcing, trade and market notes for professional buyers working with ZuriBeans.",
    body: [
      "ZuriBeans Insights is a new home for the sourcing notes, trade and logistics updates, and market context our buyers ask us for directly — published on a bi-weekly cadence rather than scattered across individual conversations.",
      "It starts small and stays honest: an article appears here once it has been written and reviewed, not before, and it only appears for the markets it is actually relevant to. If you have a topic you'd like covered, the trade desk is the fastest way to reach us.",
    ],
    category: "company-news",
    marketKeys: null,
    publishedAt: "2026-09-22",
    authorName: "ZuriBeans Editorial",
    status: "published",
    canonicalContentId: null,
  },
  {
    slug: "reading-a-uganda-harvest-report-as-a-buyer",
    title: "Reading a Uganda harvest report as a buyer",
    excerpt:
      "What a procurement team should actually take from a seasonal harvest update — and what it can't tell you.",
    body: [
      "Placeholder draft — replace with reviewed editorial copy before publishing.",
      "This entry exists to demonstrate the Insights content shape (market scoping, category, hero image) introduced by ADR-0011. It intentionally stays in draft status so it never renders on a public route or the sitemap.",
    ],
    category: "market-intelligence",
    marketKeys: ["zuribeans_ug"],
    publishedAt: "2026-09-15",
    authorName: "ZuriBeans Editorial",
    status: "draft",
    canonicalContentId: null,
  },
  {
    slug: "what-changed-in-sars-import-vat-handling",
    title: "What changed in SARS import VAT handling",
    excerpt:
      "A working note for buyers on recent South African customs process changes relevant to cross-border lots.",
    body: [
      "Placeholder draft — replace with reviewed editorial copy before publishing.",
      "This entry exists to demonstrate the Insights content shape (market scoping, category, hero image) introduced by ADR-0011. It intentionally stays in draft status so it never renders on a public route or the sitemap.",
    ],
    category: "trade-logistics",
    marketKeys: ["zuribeans_za"],
    publishedAt: "2026-09-01",
    authorName: "ZuriBeans Editorial",
    status: "draft",
    canonicalContentId: null,
  },
] as const satisfies readonly InsightArticle[]

const isPublished = (article: InsightArticle): boolean => article.status === "published"

const isVisibleForMarket = (article: InsightArticle, marketKey: ZuribeansMarketKey): boolean =>
  article.marketKeys === null || article.marketKeys.includes(marketKey)

const byPublishedAtDescending = (a: InsightArticle, b: InsightArticle): number =>
  b.publishedAt.localeCompare(a.publishedAt)

/**
 * Published, market-visible articles, optionally narrowed by category —
 * newest first. Never returns a `"draft"` article; callers do not need to
 * filter status themselves.
 *
 * `source` defaults to the real editorial content and exists as a parameter
 * (rather than a closed-over module constant) purely so unit tests can
 * exercise this filtering logic against small fixtures instead of mocking
 * module internals.
 */
export const listPublishedInsights = (
  options: { marketKey: ZuribeansMarketKey; category?: string },
  source: readonly InsightArticle[] = INSIGHT_ARTICLES,
): InsightArticle[] =>
  source
    .filter(
      (article) =>
        isPublished(article) &&
        isVisibleForMarket(article, options.marketKey) &&
        (!options.category || article.category === options.category),
    )
    .sort(byPublishedAtDescending)

/**
 * A single published article by slug, scoped to a market the same way the
 * index is — an article that exists but isn't published, or isn't scoped to
 * this market, behaves as not found rather than leaking draft content.
 */
export const getPublishedInsightBySlug = (
  slug: string,
  marketKey: ZuribeansMarketKey,
  source: readonly InsightArticle[] = INSIGHT_ARTICLES,
): InsightArticle | undefined =>
  source.find(
    (article) =>
      article.slug === slug && isPublished(article) && isVisibleForMarket(article, marketKey),
  )

/** All categories that have at least one currently-published, market-visible article. */
export const listInsightCategoriesInUse = (
  marketKey: ZuribeansMarketKey,
  source: readonly InsightArticle[] = INSIGHT_ARTICLES,
): string[] => {
  const keys = new Set(
    source
      .filter((article) => isPublished(article) && isVisibleForMarket(article, marketKey))
      .map((article) => article.category),
  )
  return Array.from(keys).filter(isInsightCategoryKey)
}

/** Published slugs only — the set `sitemap.ts` may safely enumerate. */
export const listPublishedInsightSlugs = (
  source: readonly InsightArticle[] = INSIGHT_ARTICLES,
): string[] => source.filter(isPublished).map((article) => article.slug)
