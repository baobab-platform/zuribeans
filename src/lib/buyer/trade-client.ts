import "server-only"
import { getServerEnvironment } from "@/lib/configuration/environment"
import { cookieAuthStorage } from "@/lib/auth/session-storage"
import type { BuyerCapabilitySnapshot } from "./capabilities"
import type {
  BuyerApplyInput,
  BuyerOrganisationMembership,
  BuyerOrganisationSummary,
  BuyerMembershipSummary,
} from "./types"

export class BuyerTradeError extends Error {
  constructor(
    message: string,
    readonly code: "unauthorized" | "already_applied" | "invalid_input" | "failed",
    readonly status?: number,
  ) {
    super(message)
    this.name = "BuyerTradeError"
  }
}

const authHeaders = async (): Promise<HeadersInit> => {
  const token = await cookieAuthStorage.getItem()
  if (!token) {
    throw new BuyerTradeError("No customer session", "unauthorized", 401)
  }
  const environment = getServerEnvironment()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-publishable-api-key": environment.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  }
}

const tradeUrl = (path: string): string => {
  const environment = getServerEnvironment()
  return `${environment.MEDUSA_BACKEND_URL.replace(/\/$/, "")}${path}`
}

export const listBuyerOrganisationsForCustomer = async (): Promise<
  BuyerOrganisationMembership[]
> => {
  const response = await fetch(tradeUrl("/store/b2b/organisations/me"), {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Could not load buyer organisations", "failed", response.status)
  }

  const body = (await response.json()) as {
    organisations?: BuyerOrganisationMembership[]
  }
  return body.organisations ?? []
}

export const applyForBuyerOrganisation = async (
  input: BuyerApplyInput,
): Promise<{ organisation: BuyerOrganisationSummary; membership: BuyerMembershipSummary }> => {
  const response = await fetch(tradeUrl("/store/b2b/organisations/apply"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      legal_name: input.legalName,
      trading_name: input.tradingName,
      registration_number: input.registrationNumber,
      default_market_key: input.defaultMarketKey,
      tenant_id: "zuribeans",
    }),
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (response.status === 400) {
    throw new BuyerTradeError("Invalid application", "invalid_input", 400)
  }
  if (response.status === 409 || response.status === 422) {
    throw new BuyerTradeError("Already applied", "already_applied", response.status)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Application failed", "failed", response.status)
  }

  return (await response.json()) as {
    organisation: BuyerOrganisationSummary
    membership: BuyerMembershipSummary
  }
}

export const getBuyerCapabilitySnapshot = async (): Promise<BuyerCapabilitySnapshot | null> => {
  const response = await fetch(tradeUrl("/store/b2b/capabilities"), {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (!response.ok) {
    return null
  }

  const body = (await response.json()) as {
    capabilities?: BuyerCapabilitySnapshot
  }
  return body.capabilities ?? null
}
