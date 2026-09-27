import type { MetadataRoute } from "next"
import { insightContentProvider } from "@/lib/content/insight-content-provider"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const staticPaths = [
    "",
    "/products",
    "/origins-markets",
    "/sourcing",
    "/sourcing/become-a-supplier",
    "/trade",
    "/quality-traceability",
    "/about",
    "/contact",
    "/help",
    "/insights",
  ]
  // Until market-segmented canonical URLs exist, the global sitemap advertises
  // only published articles that are visible in every enabled market. Published
  // market-scoped articles remain discoverable from /insights in their active
  // market but are intentionally excluded here; see ADR-0014.
  const insightSlugs = await insightContentProvider.listSitemapEligibleSlugs()
  const insightPaths = insightSlugs.map((slug) => `/insights/${slug}`)

  return [...staticPaths, ...insightPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
  }))
}
