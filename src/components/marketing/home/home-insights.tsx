import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { InsightCard } from "@/components/insights/insight-card"
import { insightContentProvider } from "@/lib/content/insight-content-provider"
import type { ZuribeansMarketKey } from "@/lib/market/markets"

/** Server-rendered editorial preview; never promotes a draft or bypasses CMS projection. */
export async function HomeInsights({ marketKey }: { marketKey: ZuribeansMarketKey }) {
  const articles = (await insightContentProvider.listPublished({ marketKey })).slice(0, 3)
  if (!articles.length) return null

  return (
    <section
      className="border-t border-line bg-canvas py-20 lg:py-28"
      aria-labelledby="home-insights-heading"
    >
      <div className="page-container">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">Trade intelligence</p>
            <h2
              id="home-insights-heading"
              className="mt-4 max-w-3xl font-display text-[clamp(2rem,4vw,3.2rem)] font-normal leading-[1.12] tracking-tight"
            >
              Context for better decisions.{" "}
              <em className="font-normal">From origin to execution.</em>
            </h2>
          </div>
          <p className="max-w-sm leading-7 text-muted lg:col-span-4">
            Published sourcing, quality and trade perspectives for professional procurement teams.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <InsightCard key={article.slug} article={article} />
          ))}
        </div>
        <div className="mt-9 text-center">
          <Link
            href="/insights"
            className="inline-flex min-h-12 items-center gap-2 rounded-control border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-white"
          >
            View all insights <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
