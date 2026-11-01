import type { ProductDossierData } from "@/lib/commerce/product-dossier-model"

/** Visual facts carry provenance. Only explicit local synthetic mode may display fabricated commercial states. */
export type ProductCardVisual = {
  source: "synthetic" | "provider"
  displayName?: string
  originLabel?: string
  category?: string
  grade?: string
  process?: string
  certification?: string
  supplyStatus?: "Available" | "Limited" | "Out of Season"
  harvest?: string
  minimumOrder?: string
  incoterms?: string
}

export type ProductCardModel = {
  cardFacts?: ProductCardVisual
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
  categories: string[]
  certifications: string[]
  qualityInformation: string | null
  specifications: Array<{ label: string; value: string }>
  variants: Array<{ id: string; title: string; sku: string | null }>
  /** Optional separately governed public dossier, absent until provider publication. */
  dossier?: ProductDossierData
}
