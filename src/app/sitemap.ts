import type { MetadataRoute } from "next"
import { listPublishedInsightSlugs } from "@/lib/content/insights"

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
  // Draft articles are excluded here the same way they're excluded from the
  // index and detail routes — see `listPublishedInsightSlugs` and ADR-0011.
  const insightPaths = listPublishedInsightSlugs().map((slug) => `/insights/${slug}`)

  return [...staticPaths, ...insightPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
  }))
}
