import "server-only"
import type { BuyerCapabilitySnapshot } from "./capabilities"
import {
  getBuyerCapabilitySnapshot,
  listBuyerOrganisationsForCustomer,
  BuyerTradeError,
} from "./trade-client"
import type { BuyerOrganisationSummary } from "./types"

export type BuyerAccountContext = {
  organisation: BuyerOrganisationSummary | null
  capabilities: BuyerCapabilitySnapshot | null
  loadFailed: boolean
}

export const resolveBuyerAccountContext = async (): Promise<BuyerAccountContext> => {
  let organisation: BuyerOrganisationSummary | null = null
  let capabilities: BuyerCapabilitySnapshot | null = null
  let loadFailed = false

  try {
    const [rows, snapshot] = await Promise.all([
      listBuyerOrganisationsForCustomer(),
      getBuyerCapabilitySnapshot(),
    ])
    organisation = rows.find((row) => row.organisation)?.organisation ?? null
    capabilities = snapshot
  } catch (error) {
    if (!(error instanceof BuyerTradeError && error.code === "unauthorized")) {
      loadFailed = true
    }
  }

  return { organisation, capabilities, loadFailed }
}
