import type { MetadataRoute } from "next"
import { listSitemapEligibleInsightSlugs } from "@/lib/content/insights"

export default function sitemap(): MetadataRoute.Sitemap {
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
  // market but are intentionally excluded here; see ADR-0011.
  const insightPaths = listSitemapEligibleInsightSlugs().map((slug) => `/insights/${slug}`)

  return [...staticPaths, ...insightPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
  }))
}
