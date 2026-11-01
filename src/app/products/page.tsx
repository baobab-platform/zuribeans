import Link from "next/link"
import { redirect } from "next/navigation"
import { ProductCard } from "@/components/commerce/product-card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/form-controls"
import { EmptyState, ErrorState } from "@/components/ui/state-panel"
import { catalogueHref, parseCatalogueQuery } from "@/lib/catalogue/query"
import {
  catalogueNavigationCategories,
  PUBLIC_CATALOGUE_CATEGORIES,
} from "@/lib/catalogue/navigation-categories"
import { getMarketContext } from "@/lib/market/request"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import { listProductCategories, listProducts } from "@/lib/medusa/products"
import type { ProductCategoryModel, ProductListModel } from "@/lib/medusa/types"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const dynamic = "force-dynamic"

export const metadata = getPublicPageMetadata({
  title: "Product catalogue",
  description:
    "Explore ZuriBeans agricultural product classes and published lots for professional buyers.",
  path: "/products",
})

const PAGE_SIZE = 12

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = parseCatalogueQuery(await searchParams)
  const { active: market } = await getMarketContext()
  const synthetic = isSyntheticExperienceEnabled()
  let categories: ProductCategoryModel[] = []
  let catalogue: ProductListModel | null = null
  let failed = false

  try {
    const categoriesPromise = listProductCategories()
    if (!query.category) {
      const [resolvedCategories, resolvedCatalogue] = await Promise.all([
        categoriesPromise,
        listProducts({
          countryCode: market.countryCode,
          marketKey: market.marketKey,
          query: query.query,
          limit: PAGE_SIZE,
          offset: (query.page - 1) * PAGE_SIZE,
        }),
      ])
      categories = resolvedCategories
      catalogue = resolvedCatalogue
    } else {
      categories = await categoriesPromise
    }
    const category = query.category
      ? categories.find((candidate) => candidate.handle === query.category)
      : undefined
    if (query.category) {
      catalogue = category
        ? await listProducts({
            countryCode: market.countryCode,
            marketKey: market.marketKey,
            query: query.query,
            categoryId: category.id,
            limit: PAGE_SIZE,
            offset: (query.page - 1) * PAGE_SIZE,
          })
        : { items: [], count: 0, limit: PAGE_SIZE, offset: 0 }
    }
  } catch {
    failed = true
  }

  const navigationCategories = catalogueNavigationCategories(categories)
  // The approved Make toolbar has four commodity filters plus All.
  // Additional provider taxonomy remains addressable through catalogue URLs.
  const toolbarHandles = new Set(PUBLIC_CATALOGUE_CATEGORIES.slice(0, 4).map(({ handle }) => handle))
  const toolbarCategories = navigationCategories.filter(({ handle }) => toolbarHandles.has(handle))
  const selectedCategory = navigationCategories.find(
    (category) => category.handle === query.category,
  )
  const totalPages = catalogue ? Math.max(1, Math.ceil(catalogue.count / catalogue.limit)) : 1
  if (catalogue && query.page > totalPages) {
    redirect(catalogueHref({ ...query, page: totalPages }))
  }
  const currentPage = Math.min(query.page, totalPages)

  return (
    <div className="bg-canvas">
      <div className="border-b border-line bg-surface-muted">
        <div className="page-container py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        </div>
      </div>

      <header
        className="bg-ink text-white"
        style={{ padding: "clamp(40px, 6vw, 64px) 0 clamp(32px, 5vw, 56px)" }}
      >
        <div className="page-container">
          <p className="eyebrow-inverse" style={{ marginBottom: "14px" }}>
            Procurement catalogue{synthetic ? " · Synthetic preview" : ""}
          </p>
          <h1
            className="max-w-4xl font-display"
            style={{
              fontSize: "clamp(30px, 5vw, 56px)",
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {synthetic ? "Origin-certified commodities." : "African-origin commodities."}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            {synthetic
              ? "Preview commodity grades, certification specimens, indicative stock statuses and sample commercial terms. All records are fictional until the responsible Baobab engines provide verified business facts."
              : "Discover published agricultural products for professional procurement. Product evidence, grades, availability and commercial terms require confirmation by the responsible trading systems."}
          </p>
        </div>
      </header>

      <div className="sticky z-30 border-b border-line bg-canvas" style={{ top: "64px" }}>
        <div className="page-container flex flex-wrap items-center gap-3 py-3">
          <form action="/products" method="get" className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-80">
            {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
            <label htmlFor="catalogue-search" className="min-w-0 flex-1">
              <span className="sr-only">Search products or origins</span>
              <Input
                id="catalogue-search"
                type="search"
                name="q"
                defaultValue={query.query}
                placeholder="Search products or origins…"
                maxLength={120}
              />
            </label>
            <Button type="submit">Search</Button>
          </form>
          {query.query ? (
            <ButtonLink href={catalogueHref({ category: query.category })} variant="ghost">
              Clear
            </ButtonLink>
          ) : null}
          <nav aria-label="Product categories" className="hidden min-w-0 flex-wrap items-center gap-2 sm:flex">
            <Link
              href={catalogueHref({ query: query.query })}
              aria-current={!selectedCategory ? "page" : undefined}
              className="min-h-10 rounded-control border border-line-strong px-3 py-2 text-xs font-semibold whitespace-nowrap aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
            >
              All products
            </Link>
            {toolbarCategories.map((category) => (
              <Link
                key={category.id}
                href={catalogueHref({
                  query: query.query,
                  category: category.handle,
                })}
                aria-current={selectedCategory?.id === category.id ? "page" : undefined}
                className="min-h-10 rounded-control border border-line-strong px-3 py-2 text-xs font-semibold whitespace-nowrap aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
              >
                {category.name}
              </Link>
            ))}
          </nav>
          <details className="relative sm:hidden">
            <summary className="min-h-11 cursor-pointer rounded-control border border-line-strong bg-surface px-4 py-3 text-sm font-semibold">
              Filters{selectedCategory ? " · " + selectedCategory.name : ""}
            </summary>
            <nav
              aria-label="Mobile product categories"
              className="absolute right-0 flex flex-col gap-2 rounded-control border border-line-strong bg-canvas p-4"
              style={{
                top: "calc(100% + 6px)",
                width: "min(88vw, 340px)",
                boxShadow: "0 12px 24px rgb(15 44 36 / 0.14)",
              }}
            >
              <Link
                href={catalogueHref({ query: query.query })}
                aria-current={!selectedCategory ? "page" : undefined}
                className="min-h-11 rounded-control px-4 py-3 text-sm font-semibold aria-[current=page]:bg-ink aria-[current=page]:text-white"
              >
                All products
              </Link>
              {toolbarCategories.map((category) => (
                <Link
                  key={category.id}
                  href={catalogueHref({
                    query: query.query,
                    category: category.handle,
                  })}
                  aria-current={selectedCategory?.id === category.id ? "page" : undefined}
                  className="min-h-11 rounded-control px-4 py-3 text-sm font-semibold aria-[current=page]:bg-ink aria-[current=page]:text-white"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </details>
          <p className="ml-auto shrink-0 text-xs text-muted" aria-live="polite" data-testid="catalogue-product-count">
            {catalogue
              ? `${catalogue.count} ${catalogue.count === 1 ? "product" : "products"}`
              : "Count unavailable"}
          </p>
        </div>
      </div>

      <section
        className="page-container"
        aria-label="Catalogue results"
        style={{ paddingTop: "clamp(24px, 4vw, 40px)", paddingBottom: "80px" }}
      >
        <div
          className="flex flex-wrap items-end justify-between gap-4"
          style={{ marginBottom: "24px" }}
        >
          <div>
            <h2 className="font-display text-3xl font-normal">
              {selectedCategory?.name ??
                (query.query ? "Results for “" + query.query + "”" : "All products")}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {synthetic
                ? "Illustrative market context for " +
                  market.displayName +
                  ". No stock or commercial authorisation."
                : "Published catalogue for " +
                  market.displayName +
                  " (" +
                  market.currency +
                  "). Publication does not itself confirm market sellability or current stock."}
            </p>
          </div>
        </div>

        {failed ? (
          <ErrorState
            title="The catalogue is temporarily unavailable."
            description="Current product information could not be retrieved from the trade service. No synthetic products, buyer pricing or availability have been substituted."
            action={{ href: "/contact", label: "Contact the trade desk" }}
          />
        ) : catalogue?.items.length ? (
          <>
            <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {catalogue.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {totalPages > 1 ? (
              <nav
                aria-label="Catalogue pagination"
                className="mt-14 flex items-center justify-between border-t border-line pt-6"
              >
                {currentPage > 1 ? (
                  <ButtonLink
                    href={catalogueHref({ ...query, page: currentPage - 1 })}
                    variant="outline"
                  >
                    Previous
                  </ButtonLink>
                ) : (
                  <span />
                )}
                <p className="text-sm text-muted">
                  Page {currentPage} of {totalPages}
                </p>
                {currentPage < totalPages ? (
                  <ButtonLink
                    href={catalogueHref({ ...query, page: currentPage + 1 })}
                    variant="outline"
                  >
                    Next
                  </ButtonLink>
                ) : (
                  <span />
                )}
              </nav>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={"No matching products are published for " + market.displayName + "."}
            description="Try a broader search or discuss upcoming supply with the trade desk."
            action={{ href: "/contact", label: "Discuss a requirement" }}
          />
        )}
      </section>
    </div>
  )
}
