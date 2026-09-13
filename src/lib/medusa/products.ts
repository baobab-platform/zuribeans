import "server-only"
import { createMedusaClient } from "./client"
import { normalizeProductMediaUrl } from "@/lib/configuration/product-media"
import { normalizeProductMetadata } from "./product-presentation"
import type {
  ProductCardModel,
  ProductCategoryModel,
  ProductDetailModel,
  ProductListModel,
} from "./types"

type MedusaProduct = {
  id: string
  handle?: string | null
  title: string
  subtitle?: string | null
  description?: string | null
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
  categories?: Array<{ name: string }> | null
  variants?: Array<{ id: string; title?: string | null; sku?: string | null }> | null
}

const toCard = (product: MedusaProduct): ProductCardModel => ({
  id: product.id,
  handle: product.handle || product.id,
  title: product.title,
  subtitle: product.subtitle || null,
  thumbnail: normalizeProductMediaUrl(product.thumbnail),
  origin: typeof product.metadata?.origin === "string" ? product.metadata.origin : null,
})

export type MarketPricingContext = {
  /** ISO 3166-1 alpha-2. Lower-cased for Medusa at this boundary only. */
  countryCode: string
}

export type ProductListOptions = MarketPricingContext & {
  query?: string
  categoryId?: string
  limit?: number
  offset?: number
}

export const listProductCategories = async (): Promise<ProductCategoryModel[]> => {
  const sdk = createMedusaClient()
  const { product_categories: categories } = await sdk.store.category.list({ limit: 100 })
  return categories.map(({ id, handle, name }) => ({ id, handle, name }))
}

export const listProducts = async (options: ProductListOptions): Promise<ProductListModel> => {
  const sdk = createMedusaClient()
  const { products, count, limit, offset } = await sdk.store.product.list({
    limit: options.limit ?? 12,
    offset: options.offset ?? 0,
    country_code: options.countryCode.toLowerCase(),
    ...(options.query ? { q: options.query } : {}),
    ...(options.categoryId ? { category_id: options.categoryId } : {}),
  })
  return {
    items: (products as MedusaProduct[]).map(toCard),
    count,
    limit,
    offset,
  }
}

export const retrieveProduct = async (
  handle: string,
  context?: MarketPricingContext,
): Promise<ProductDetailModel | null> => {
  const sdk = createMedusaClient()
  const { products } = await sdk.store.product.list({
    handle,
    limit: 1,
    ...(context ? { country_code: context.countryCode.toLowerCase() } : {}),
  })
  const product = (products as MedusaProduct[])[0]
  if (!product) return null
  const presentation = normalizeProductMetadata(product.metadata)
  return {
    ...toCard(product),
    description: product.description || null,
    categories: product.categories?.map(({ name }) => name) || [],
    ...presentation,
    variants:
      product.variants?.map(({ id, title, sku }) => ({
        id,
        title: title || "Standard",
        sku: sku || null,
      })) || [],
  }
}
