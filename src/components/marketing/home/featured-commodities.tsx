import Link from "next/link"
import { CommodityCard } from "@/components/commodities/commodity-card"
import { ProductCard } from "@/components/commerce/product-card"
import type { CommodityPresentation } from "@/lib/content/commodity"
import type { ProductCardModel } from "@/lib/medusa/types"

type FeaturedCommoditiesProps = {
  commodities: readonly CommodityPresentation[]
  products?: readonly ProductCardModel[]
}

/**
 * Figma Make Commodities composition. Published, market-scoped products take
 * precedence; unavailable/empty trade data never becomes fictional stock.
 * Curated classes provide a transparent discovery fallback.
 */
export function FeaturedCommodities({ commodities, products = [] }: FeaturedCommoditiesProps) {
  if (commodities.length === 0 && products.length === 0) return null

  const featuredProducts = products.slice(0, 4)
  const fallbackClasses = commodities.slice(0, Math.max(0, 4 - featuredProducts.length))
  const hasPublishedProducts = featuredProducts.length > 0
  const synthetic = featuredProducts.some((product) => product.cardFacts?.source === "synthetic")

  return (
    <section
      id="commodities"
      className="bg-canvas py-14 sm:py-20 lg:py-24"
      aria-labelledby="featured-commodities-heading"
    >
      <div className="page-container">
        <header
          className="grid gap-6 lg:grid-cols-12"
          style={{ marginBottom: "clamp(36px, 5vw, 64px)" }}
        >
          <div className="lg:col-span-7">
            <p className="eyebrow" style={{ marginBottom: "14px" }}>
              Procurement catalogue
            </p>
            <h2
              id="featured-commodities-heading"
              className="font-display text-ink"
              style={{
                fontSize: "clamp(28px, 4vw, 50px)",
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {synthetic ? "Origin-certified commodities." : "African-origin commodities."}
              <span className="block">
                <em>
                  {synthetic
                    ? "Grade-documented, export-ready."
                    : "Specified for professional trade."}
                </em>
              </span>
            </h2>
          </div>
          <p className="max-w-xl self-end text-sm leading-7 text-muted lg:col-span-5">
            {synthetic
              ? "Explore sample grades, certifications, inventory states and indicative terms. Every product and commercial fact in this preview is fictional until its owning Baobab engine qualifies the real evidence."
              : hasPublishedProducts
                ? "Explore published products and product-class discovery where publications are limited. Certification, availability and commercial terms require independent confirmation."
                : "Explore our principal product classes. Individual products, grades, evidence and availability appear only when published by the responsible trade systems."}
          </p>
        </header>

        <div
          id="featured-commodities"
          className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {fallbackClasses.map((commodity) => (
            <CommodityCard key={commodity.id} commodity={commodity} />
          ))}
        </div>

        <div className="flex justify-center" style={{ marginTop: "36px" }}>
          <Link
            href="/products"
            className="inline-flex min-h-12 items-center justify-center rounded-control border border-ink px-7 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
            style={{ letterSpacing: "0.04em" }}
          >
            Full Procurement Catalogue
          </Link>
        </div>
      </div>
    </section>
  )
}
