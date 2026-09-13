import type { MetadataRoute } from "next"
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return [
    "",
    "/products",
    "/origins-markets",
    "/sourcing",
    "/sourcing/become-a-supplier",
    "/trade",
    "/quality-traceability",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
  }))
}
