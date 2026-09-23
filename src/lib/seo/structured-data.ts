export const serializeStructuredData = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c")

export const getOrganizationStructuredData = (siteUrl: URL) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZuriBeans",
  url: siteUrl.toString(),
  description: "B2B sourcing and cross-border trade for quality African agricultural products.",
  areaServed: [
    { "@type": "Country", name: "Uganda" },
    { "@type": "Country", name: "South Africa" },
  ],
  knowsAbout: [
    "Agricultural sourcing",
    "Coffee",
    "Vanilla",
    "Product provenance",
    "Cross-border trade",
  ],
})

/**
 * `BlogPosting` JSON-LD for a published Insights article. Only ever called
 * with a published article (see `getPublishedInsightBySlug`), and only ever
 * emits fields the article data actually has — no invented `dateModified`,
 * no invented author credentials, matching the discipline `getOrganizationStructuredData`
 * and Product JSON-LD already apply on this estate (see ADR-0011, docs/frontend/seo.md).
 */
export const getInsightArticleStructuredData = (options: {
  siteUrl: URL
  path: `/${string}`
  title: string
  description: string
  authorName: string
  publishedAt: string
  imageUrl?: string
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: options.title,
  description: options.description,
  url: new URL(options.path, options.siteUrl).toString(),
  datePublished: options.publishedAt,
  author: { "@type": "Organization", name: options.authorName },
  publisher: { "@type": "Organization", name: "ZuriBeans" },
  ...(options.imageUrl ? { image: options.imageUrl } : {}),
})
