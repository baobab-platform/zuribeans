import "server-only"
import { getServerEnvironment } from "@/lib/configuration/environment"
import { cookieAuthStorage } from "@/lib/auth/session-storage"
import type { BuyerCapabilitySnapshot } from "./capabilities"
import type {
  BuyerApplyInput,
  BuyerOrganisationMembership,
  BuyerOrganisationSummary,
  BuyerMembershipSummary,
  BuyerTeamMember,
  BuyerTaxRegistration,
} from "./types"

export class BuyerTradeError extends Error {
  constructor(
    message: string,
    readonly code:
      | "unauthorized"
      | "already_applied"
      | "invalid_input"
      | "failed"
      | "forbidden"
      | "duplicate"
      | "not_found",
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

export const listOrganisationMembers = async (
  organisationId: string,
): Promise<BuyerTeamMember[]> => {
  const response = await fetch(tradeUrl(`/store/b2b/organisations/${organisationId}/members`), {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (response.status === 403) {
    throw new BuyerTradeError("Not a member of this organisation", "forbidden", 403)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Could not load team members", "failed", response.status)
  }

  const body = (await response.json()) as { members?: BuyerTeamMember[] }
  return body.members ?? []
}

export const inviteOrganisationMember = async (
  organisationId: string,
  input: { email: string; role?: string },
): Promise<{ invitationToken: string }> => {
  const response = await fetch(tradeUrl(`/store/b2b/organisations/${organisationId}/members`), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      email: input.email,
      role: input.role,
    }),
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (response.status === 403) {
    throw new BuyerTradeError("Only ACCOUNT_ADMIN can invite", "forbidden", 403)
  }
  if (response.status === 400) {
    throw new BuyerTradeError("Invalid invite", "invalid_input", 400)
  }
  if (response.status === 409 || response.status === 422) {
    throw new BuyerTradeError("Already invited", "duplicate", response.status)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Invite failed", "failed", response.status)
  }

  const body = (await response.json()) as { invitation_token?: string }
  return { invitationToken: body.invitation_token ?? "" }
}

export const acceptInvitation = async (invitationToken: string): Promise<void> => {
  const response = await fetch(tradeUrl("/store/b2b/invitations/accept"), {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ invitation_token: invitationToken }),
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (response.status === 404) {
    throw new BuyerTradeError("Invitation not found", "not_found", 404)
  }
  if (response.status === 400) {
    throw new BuyerTradeError("Invalid invitation", "invalid_input", 400)
  }
  if (response.status === 403 || response.status === 409) {
    throw new BuyerTradeError("Cannot accept invitation", "forbidden", response.status)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Accept failed", "failed", response.status)
  }
}

export const listTaxRegistrations = async (
  organisationId: string,
): Promise<BuyerTaxRegistration[]> => {
  const response = await fetch(
    tradeUrl(`/store/b2b/organisations/${organisationId}/tax-registrations`),
    {
      method: "GET",
      headers: await authHeaders(),
      cache: "no-store",
    },
  )

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (response.status === 403) {
    throw new BuyerTradeError("Forbidden", "forbidden", 403)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Could not load tax registrations", "failed", response.status)
  }

  const body = (await response.json()) as { tax_registrations?: BuyerTaxRegistration[] }
  return body.tax_registrations ?? []
}

export const createTaxRegistration = async (
  organisationId: string,
  input: {
    marketKey: string
    countryCode: string
    registrationType: string
    registrationNumber: string
  },
): Promise<void> => {
  const response = await fetch(
    tradeUrl(`/store/b2b/organisations/${organisationId}/tax-registrations`),
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        market_key: input.marketKey,
        country_code: input.countryCode,
        registration_type: input.registrationType,
        registration_number: input.registrationNumber,
      }),
      cache: "no-store",
    },
  )

  if (response.status === 401) {
    throw new BuyerTradeError("Session expired", "unauthorized", 401)
  }
  if (response.status === 403) {
    throw new BuyerTradeError("Only ACCOUNT_ADMIN can update tax profile", "forbidden", 403)
  }
  if (response.status === 400) {
    throw new BuyerTradeError("Invalid tax registration", "invalid_input", 400)
  }
  if (response.status === 409 || response.status === 422) {
    throw new BuyerTradeError("Duplicate tax registration", "duplicate", response.status)
  }
  if (!response.ok) {
    throw new BuyerTradeError("Could not save tax registration", "failed", response.status)
  }
}
