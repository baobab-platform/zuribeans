import type { ProductCategoryModel } from "@/lib/medusa/types"

/**
 * Public category navigation is independent of Medusa publication state.
 * This is a taxonomy of browsing destinations, NEVER proof of inventory,
 * trade assent, stock, product certification or market sellability.
 *
 * Provider category IDs remain authoritative for actual product filtering.
 */
export const PUBLIC_CATALOGUE_CATEGORIES: readonly Pick<
  ProductCategoryModel,
  "handle" | "name"
>[] = [
  { handle: "coffee", name: "Coffee" },
  { handle: "vanilla", name: "Vanilla" },
  { handle: "sesame", name: "Grains & Seeds" },
  { handle: "rooibos", name: "Botanicals" },
  { handle: "sorghum", name: "Sorghum" },
  { handle: "related", name: "Related products" },
]

export function catalogueNavigationCategories(
  providerCategories: readonly ProductCategoryModel[],
): ProductCategoryModel[] {
  const byHandle = new Map<string, ProductCategoryModel>()
  for (const category of PUBLIC_CATALOGUE_CATEGORIES) {
    byHandle.set(category.handle, {
      id: `navigation-${category.handle}`,
      handle: category.handle,
      name: category.name,
    })
  }
  for (const category of providerCategories) {
    byHandle.set(category.handle, category)
  }
  return [...byHandle.values()]
}
