import "server-only"
import { getServerEnvironment } from "@/lib/configuration/environment"
import type { ZuribeansMarketKey } from "@/lib/market/markets"

/**
 * Estate composition of Trade market assortment (ADR-0030 §7 / ADR-0024).
 * Does not invent sellability in the estate — only intersects Medusa publication
 * with Trade's sellable_product_ids for the active market_key.
 */

export type AssortmentFilterMode = "off" | "strict"

export type AssortmentSnapshot = {
  marketKey: string
  sellableProductIds: string[]
  mode: AssortmentFilterMode
  source: "trade" | "bypass"
}

/** Pure intersection — unit-tested without HTTP. */
export const intersectProductsBySellableIds = <T extends { id: string }>(
  products: T[],
  sellableProductIds: readonly string[] | null,
): T[] => {
  if (sellableProductIds === null) return products
  const allowed = new Set(sellableProductIds)
  return products.filter((p) => allowed.has(p.id))
}

/**
 * When ZB06_ASSORTMENT_FILTER is not "strict", catalogue behaviour is unchanged
 * (Trade route may not be deployed yet). In strict mode, missing/failed Trade
 * assortment yields zero sellable ids (fail closed).
 */
export const getAssortmentFilterMode = (): AssortmentFilterMode => {
  const raw = process.env.ZB06_ASSORTMENT_FILTER?.trim().toLowerCase()
  return raw === "strict" ? "strict" : "off"
}

export const fetchMarketSellableProductIds = async (
  marketKey: ZuribeansMarketKey,
): Promise<AssortmentSnapshot> => {
  const mode = getAssortmentFilterMode()
  if (mode === "off") {
    return {
      marketKey,
      sellableProductIds: [],
      mode,
      source: "bypass",
    }
  }

  const environment = getServerEnvironment()
  const baseUrl = environment.MEDUSA_BACKEND_URL.replace(/\/$/, "")
  const url = new URL(`${baseUrl}/store/b2b/assortment`)
  url.searchParams.set("market_key", marketKey)
  url.searchParams.set("require_regulatory_clearance", "true")

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-publishable-api-key": environment.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
      },
      // Assortment is market policy — avoid stale CDN cache of sellability
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        marketKey,
        sellableProductIds: [],
        mode,
        source: "trade",
      }
    }

    const json = (await response.json()) as { sellable_product_ids?: unknown }
    const ids = Array.isArray(json.sellable_product_ids)
      ? json.sellable_product_ids.filter((id): id is string => typeof id === "string")
      : []

    return {
      marketKey,
      sellableProductIds: ids,
      mode,
      source: "trade",
    }
  } catch {
    return {
      marketKey,
      sellableProductIds: [],
      mode,
      source: "trade",
    }
  }
}

export const applyAssortmentToProductList = <T extends { id: string }>(
  products: T[],
  snapshot: AssortmentSnapshot,
): T[] => {
  if (snapshot.mode === "off" || snapshot.source === "bypass") {
    return products
  }
  return intersectProductsBySellableIds(products, snapshot.sellableProductIds)
}
