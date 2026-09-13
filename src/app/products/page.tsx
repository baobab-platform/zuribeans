import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProductCard } from "@/components/commerce/product-card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/form-controls"
import { EmptyState, ErrorState } from "@/components/ui/state-panel"
import { catalogueHref, parseCatalogueQuery } from "@/lib/catalogue/query"
import { getMarketContext } from "@/lib/market/request"
import { listProductCategories, listProducts } from "@/lib/medusa/products"
import type { ProductCategoryModel, ProductListModel } from "@/lib/medusa/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Product catalogue",
  description:
    "Explore ZuriBeans agricultural product classes and published lots for professional buyers.",
}

const PAGE_SIZE = 12

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = parseCatalogueQuery(await searchParams)
  const { active: market } = await getMarketContext()
  let categories: ProductCategoryModel[] = []
  let catalogue: ProductListModel | null = null
  let failed = false

  try {
    categories = await listProductCategories()
    const category = query.category
      ? categories.find((candidate) => candidate.handle === query.category)
      : undefined
    catalogue =
      query.category && !category
        ? { items: [], count: 0, limit: PAGE_SIZE, offset: 0 }
        : await listProducts({
            countryCode: market.countryCode,
            query: query.query,
            categoryId: category?.id,
            limit: PAGE_SIZE,
            offset: (query.page - 1) * PAGE_SIZE,
          })
  } catch {
    failed = true
  }

  const selectedCategory = categories.find((category) => category.handle === query.category)
  const totalPages = catalogue ? Math.max(1, Math.ceil(catalogue.count / catalogue.limit)) : 1
  if (catalogue && query.page > totalPages) {
    redirect(catalogueHref({ ...query, page: totalPages }))
  }
  const currentPage = Math.min(query.page, totalPages)

  return (
    <section className="page-container py-12 lg:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
        <div>
          <p className="eyebrow">Current catalogue</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-tight text-balance md:text-7xl">
            Products for professional procurement.
          </h1>
        </div>
        <p className="text-sm leading-6 text-muted">
          Showing published products for {market.displayName} ({market.currency}). Applicable price,
          eligibility and availability are confirmed through the authoritative trade service.
        </p>
      </div>

      <div className="mt-12 border-y border-line py-6">
        <form
          action="/products"
          method="get"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
          <label className="min-w-0 flex-1 font-semibold" htmlFor="catalogue-search">
            Search products
            <Input
              id="catalogue-search"
              type="search"
              name="q"
              defaultValue={query.query}
              placeholder="Name, origin or specification"
              maxLength={120}
            />
          </label>
          <Button type="submit">Search catalogue</Button>
          {query.query ? (
            <ButtonLink
              href={catalogueHref({ category: query.category })}
              variant="ghost"
              className="sm:self-end"
            >
              Clear search
            </ButtonLink>
          ) : null}
        </form>
      </div>

      {categories.length ? (
        <nav aria-label="Product categories" className="mt-7 flex flex-wrap gap-2">
          <Link
            href={catalogueHref({ query: query.query })}
            aria-current={!selectedCategory ? "page" : undefined}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
          >
            All products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={catalogueHref({ query: query.query, category: category.handle })}
              aria-current={selectedCategory?.id === category.id ? "page" : undefined}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl">
          {selectedCategory?.name ??
            (query.query ? `Results for “${query.query}”` : "All products")}
        </h2>
        {catalogue ? (
          <p className="text-sm text-muted">
            {catalogue.count} {catalogue.count === 1 ? "product" : "products"}
          </p>
        ) : null}
      </div>

      {failed ? (
        <div className="mt-8">
          <ErrorState
            title="The catalogue is temporarily unavailable."
            description="We could not retrieve current product information from the trade service. No cached buyer pricing or availability has been substituted."
            action={{ href: "/contact", label: "Contact the trade desk" }}
          />
        </div>
      ) : catalogue?.items.length ? (
        <>
          <div className="mt-8 grid gap-x-7 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="mt-8">
          <EmptyState
            title={`No matching products are published for ${market.displayName}.`}
            description="Try a broader search or discuss upcoming supply with the trade desk."
            action={{ href: "/contact", label: "Discuss a requirement" }}
          />
        </div>
      )}
    </section>
  )
}
