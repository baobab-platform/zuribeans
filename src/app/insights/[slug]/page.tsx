import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { StructuredData } from "@/components/seo/structured-data"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { getInsightCategory } from "@/lib/content/insights-categories"
import { getPublishedInsightBySlug } from "@/lib/content/insights"
import { getMarketContext } from "@/lib/market/request"
import { getInsightArticleStructuredData } from "@/lib/seo/structured-data"

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")

type InsightPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: InsightPageProps): Promise<Metadata> {
  const { slug } = await params
  const canonical = `/insights/${encodeURIComponent(slug)}`
  const { active: market } = await getMarketContext()
  const article = getPublishedInsightBySlug(slug, market.marketKey)
  if (!article) return { title: "Insight not found", alternates: { canonical } }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: canonical,
      publishedTime: article.publishedAt,
      ...(article.heroImage ? { images: [{ url: article.heroImage.src }] } : {}),
    },
    twitter: {
      card: article.heroImage ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt,
      ...(article.heroImage ? { images: [article.heroImage.src] } : {}),
    },
  }
}

export default async function InsightArticlePage({ params }: InsightPageProps) {
  const { slug } = await params
  const { active: market } = await getMarketContext()
  const article = getPublishedInsightBySlug(slug, market.marketKey)
  if (!article) notFound()

  const category = getInsightCategory(article.category)

  return (
    <article className="page-container py-12 lg:py-16">
      <StructuredData
        data={getInsightArticleStructuredData({
          siteUrl,
          path: `/insights/${article.slug}`,
          title: article.title,
          description: article.excerpt,
          authorName: article.authorName,
          publishedAt: article.publishedAt,
          imageUrl: article.heroImage
            ? new URL(article.heroImage.src, siteUrl).toString()
            : undefined,
        })}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Insights", href: "/insights" },
          { label: article.title },
        ]}
      />
      <header className="mt-8 max-w-3xl">
        {category ? <p className="eyebrow">{category.label}</p> : null}
        <h1 className="mt-4 font-display text-4xl leading-tight text-balance md:text-6xl">
          {article.title}
        </h1>
        <p className="mt-5 flex items-center gap-3 text-sm text-muted">
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{article.authorName}</span>
        </p>
      </header>

      {article.heroImage ? (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-panel bg-sand">
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="prose prose-neutral mt-10 max-w-3xl md:prose-lg">
        {article.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
