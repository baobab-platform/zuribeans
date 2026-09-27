import Link from "next/link"
import { InsightCard } from "@/components/insights/insight-card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { EmptyState } from "@/components/ui/state-panel"
import { INSIGHT_CATEGORIES } from "@/lib/content/insights-categories"
import { listInsightCategoriesInUse, listPublishedInsights } from "@/lib/content/insights"
import { getMarketContext } from "@/lib/market/request"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "Insights",
  description:
    "Sourcing, trade and market notes for professional buyers working across ZuriBeans' origin markets.",
  path: "/insights",
})

type InsightsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const asSingleParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const params = await searchParams
  const requestedCategory = asSingleParam(params.category)
  const { active: market } = await getMarketContext()

  const categoriesInUse = listInsightCategoriesInUse(market.marketKey)
  const selectedCategory = categoriesInUse.includes(requestedCategory ?? "")
    ? requestedCategory
    : undefined
  const articles = listPublishedInsights({
    marketKey: market.marketKey,
    category: selectedCategory,
  })

  return (
    <section className="page-container py-12 lg:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
      <div className="mt-8 max-w-3xl">
        <p className="eyebrow">Insights</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-balance md:text-7xl">
          Sourcing and trade notes for {market.displayName}.
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">
          Bi-weekly notes on sourcing, trade, logistics and market context — written for buyers
          working with ZuriBeans, not general audience marketing copy.
        </p>
      </div>

      {categoriesInUse.length ? (
        <nav aria-label="Insight categories" className="mt-10 flex flex-wrap gap-2">
          <Link
            href="/insights"
            aria-current={!selectedCategory ? "page" : undefined}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
          >
            All insights
          </Link>
          {INSIGHT_CATEGORIES.filter((category) => categoriesInUse.includes(category.key)).map(
            (category) => (
              <Link
                key={category.key}
                href={`/insights?category=${category.key}`}
                aria-current={selectedCategory === category.key ? "page" : undefined}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
              >
                {category.label}
              </Link>
            ),
          )}
        </nav>
      ) : null}

      {articles.length ? (
        <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <InsightCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title={`No insights are published for ${market.displayName} yet.`}
            description="Check back soon — new sourcing and trade notes are added on a bi-weekly cadence."
            action={{ href: "/contact", label: "Ask the trade desk directly" }}
          />
        </div>
      )}
    </section>
  )
}
