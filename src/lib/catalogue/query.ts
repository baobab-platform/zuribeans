export type CatalogueQuery = {
  query?: string
  category?: string
  page: number
}

type SearchParamValue = string | string[] | undefined
const first = (value: SearchParamValue) => (Array.isArray(value) ? value[0] : value)

export const parseCatalogueQuery = (params: Record<string, SearchParamValue>): CatalogueQuery => {
  const query = first(params.q)?.trim().slice(0, 120) || undefined
  const rawCategory = first(params.category)?.trim().toLowerCase()
  const category = rawCategory?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)?.[0]
  const rawPage = Number.parseInt(first(params.page) ?? "1", 10)
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1
  return { query, category, page }
}

export const catalogueHref = (query: Omit<CatalogueQuery, "page"> & { page?: number }): string => {
  const params = new URLSearchParams()
  if (query.query) params.set("q", query.query)
  if (query.category) params.set("category", query.category)
  if (query.page && query.page > 1) params.set("page", String(query.page))
  const encoded = params.toString()
  return encoded ? `/products?${encoded}` : "/products"
}
