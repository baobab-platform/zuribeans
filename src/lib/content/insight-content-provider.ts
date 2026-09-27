import type { ZuribeansMarketKey } from "@/lib/market/markets"
import {
  INSIGHT_ARTICLES,
  getPublishedInsightBySlug,
  listInsightCategoriesInUse,
  listPublishedInsights,
  listSitemapEligibleInsightSlugs,
  type InsightArticle,
} from "./insights"

export type ListInsightsOptions = {
  marketKey: ZuribeansMarketKey
  category?: string
}

/**
 * Read boundary consumed by the public estate. Payload remains the canonical
 * editorial authority; the current adapter is a temporary repository-backed
 * projection until the CMS delivery contract is available (ADR-0014).
 */
export interface InsightContentProvider {
  listPublished(options: ListInsightsOptions): Promise<readonly InsightArticle[]>
  getPublishedBySlug(
    slug: string,
    marketKey: ZuribeansMarketKey,
  ): Promise<InsightArticle | undefined>
  listCategoriesInUse(marketKey: ZuribeansMarketKey): Promise<readonly string[]>
  listSitemapEligibleSlugs(): Promise<readonly string[]>
  listSyndicationEligible(): Promise<readonly InsightArticle[]>
}

export class FileInsightContentProvider implements InsightContentProvider {
  constructor(private readonly source: readonly InsightArticle[] = INSIGHT_ARTICLES) {}

  async listPublished(options: ListInsightsOptions): Promise<readonly InsightArticle[]> {
    return listPublishedInsights(options, this.source)
  }

  async getPublishedBySlug(
    slug: string,
    marketKey: ZuribeansMarketKey,
  ): Promise<InsightArticle | undefined> {
    return getPublishedInsightBySlug(slug, marketKey, this.source)
  }

  async listCategoriesInUse(marketKey: ZuribeansMarketKey): Promise<readonly string[]> {
    return listInsightCategoriesInUse(marketKey, this.source)
  }

  async listSitemapEligibleSlugs(): Promise<readonly string[]> {
    return listSitemapEligibleInsightSlugs(this.source)
  }

  async listSyndicationEligible(): Promise<readonly InsightArticle[]> {
    const eligibleSlugs = new Set(listSitemapEligibleInsightSlugs(this.source))
    return this.source
      .filter((article) => eligibleSlugs.has(article.slug))
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
  }
}

export const insightContentProvider: InsightContentProvider = new FileInsightContentProvider()
