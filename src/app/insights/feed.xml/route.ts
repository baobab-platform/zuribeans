import { insightContentProvider } from "@/lib/content/insight-content-provider"

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")

const escapeXml = (value: string): string =>
  value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }
    return entities[character] ?? character
  })

export async function GET() {
  const articles = await insightContentProvider.listSyndicationEligible()
  const updatedAt = articles[0]?.publishedAt ?? new Date(0).toISOString()

  const entries = articles
    .map((article) => {
      const url = new URL(`/insights/${encodeURIComponent(article.slug)}`, siteUrl).toString()
      return `  <entry>
    <id>${escapeXml(url)}</id>
    <title>${escapeXml(article.title)}</title>
    <link href="${escapeXml(url)}" />
    <updated>${new Date(article.publishedAt).toISOString()}</updated>
    <author><name>${escapeXml(article.authorName)}</name></author>
    <summary>${escapeXml(article.excerpt)}</summary>
  </entry>`
    })
    .join("\n")

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(new URL("/insights", siteUrl).toString())}</id>
  <title>ZuriBeans Insights</title>
  <link href="${escapeXml(new URL("/insights/feed.xml", siteUrl).toString())}" rel="self" />
  <link href="${escapeXml(new URL("/insights", siteUrl).toString())}" />
  <updated>${new Date(updatedAt).toISOString()}</updated>
${entries}
</feed>
`

  return new Response(feed, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
