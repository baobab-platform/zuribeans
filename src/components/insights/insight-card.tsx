import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getInsightCategory } from "@/lib/content/insights-categories"
import type { InsightArticle } from "@/lib/content/insights"

type InsightCardProps = {
  article: InsightArticle
}

export function InsightCard({ article }: InsightCardProps) {
  const category = getInsightCategory(article.category)

  return (
    <Link
      href={`/insights/${article.slug}`}
      className="group block h-full rounded-panel focus-visible:outline-offset-4"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface-raised shadow-panel transition-transform group-hover:-translate-y-1">
        {article.heroImage ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-sand">
            <Image
              src={article.heroImage.src}
              alt={article.heroImage.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-7 md:p-8">
          {category ? <p className="eyebrow">{category.label}</p> : null}
          <h3 className="mt-4 font-display text-2xl leading-snug">{article.title}</h3>
          <p className="mt-3 flex-1 leading-7 text-muted">{article.excerpt}</p>
          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="inline-flex items-center gap-2 font-semibold text-clay-on-light">
              Read
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
