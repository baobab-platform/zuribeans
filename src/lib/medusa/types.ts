export type ProductCardModel = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  thumbnail: string | null
  origin: string | null
}

export type ProductCategoryModel = {
  id: string
  handle: string
  name: string
}

export type ProductListModel = {
  items: ProductCardModel[]
  count: number
  limit: number
  offset: number
}

export type ProductDetailModel = ProductCardModel & {
  description: string | null
  variants: Array<{ id: string; title: string }>
}
