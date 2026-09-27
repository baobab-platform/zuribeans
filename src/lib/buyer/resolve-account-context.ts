import "server-only"
import type { BuyerCapabilitySnapshot } from "./capabilities"
import {
  getBuyerCapabilitySnapshot,
  listBuyerRelationshipsForCustomer,
  BuyerTradeError,
} from "./trade-client"
import type { BuyerApplicationSummary, BuyerOrganisationSummary } from "./types"

export type BuyerAccountContext = {
  application: BuyerApplicationSummary | null
  organisation: BuyerOrganisationSummary | null
  capabilities: BuyerCapabilitySnapshot | null
  loadFailed: boolean
}

export const resolveBuyerAccountContext = async (): Promise<BuyerAccountContext> => {
  let application: BuyerApplicationSummary | null = null
  let organisation: BuyerOrganisationSummary | null = null
  let capabilities: BuyerCapabilitySnapshot | null = null
  let loadFailed = false

  try {
    const [rows, snapshot] = await Promise.all([
      listBuyerRelationshipsForCustomer(),
      getBuyerCapabilitySnapshot(),
    ])
    application = rows.applications[0] ?? null
    organisation = rows.organisations.find((row) => row.organisation)?.organisation ?? null
    capabilities = snapshot
  } catch (error) {
    if (!(error instanceof BuyerTradeError && error.code === "unauthorized")) {
      loadFailed = true
    }
  }

  return { application, organisation, capabilities, loadFailed }
}
