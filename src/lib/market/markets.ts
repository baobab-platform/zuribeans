/**
 * Candidate Baobab Market catalogue for the Zuribeans estate.
 *
 * These `marketKey` values mirror the candidate `canonical_key`s that
 * baobab-platform/baobab-trade's market bootstrap (`src/baobab/market/market-config.ts`)
 * uses to provision its own Medusa-side projection ahead of Control Plane
 * approval. `baobab-platform/shared`'s `contracts/legal-entity/registry.yaml` still
 * lists the ZURIBEANS entity's `markets` as empty pending that approval, so
 * these are candidates, not activated canonical Markets. Once Control Plane
 * registers and activates the real Markets, resolve this list against the
 * resulting `market_id`s rather than inventing a parallel identifier — do not
 * add a market here that Trade has not also bootstrapped under the same key.
 */
export type ZuribeansMarketKey = "zuribeans_ug" | "zuribeans_za"

export type ZuribeansMarket = {
  marketKey: ZuribeansMarketKey
  displayName: string
  /** ISO 3166-1 alpha-2, uppercase, matching Trade's `MarketBootstrapConfig.countryCode`. */
  countryCode: string
  /** ISO 4217, uppercase, matching Trade's `MarketBootstrapConfig.defaultCurrency`. */
  currency: string
  locale: string
}

export const ZURIBEANS_MARKETS: readonly ZuribeansMarket[] = [
  {
    marketKey: "zuribeans_ug",
    displayName: "Uganda",
    countryCode: "UG",
    currency: "UGX",
    locale: "en-UG",
  },
  {
    marketKey: "zuribeans_za",
    displayName: "South Africa",
    countryCode: "ZA",
    currency: "ZAR",
    locale: "en-ZA",
  },
]

export const isZuribeansMarketKey = (value: string): value is ZuribeansMarketKey =>
  ZURIBEANS_MARKETS.some((market) => market.marketKey === value)

export const getMarket = (marketKey: ZuribeansMarketKey): ZuribeansMarket => {
  const market = ZURIBEANS_MARKETS.find((candidate) => candidate.marketKey === marketKey)
  if (!market) {
    const known = ZURIBEANS_MARKETS.map((candidate) => candidate.marketKey).join(", ")
    throw new Error(`Unknown Zuribeans market key "${marketKey}". Known keys: ${known}`)
  }
  return market
}
