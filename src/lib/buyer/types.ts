export type BuyerOrganisationStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED"

export type BuyerMembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED"

export type BuyerOrganisationSummary = {
  id: string
  legal_name: string
  trading_name: string | null
  registration_number: string | null
  status: BuyerOrganisationStatus
  tenant_id: string
  default_market_key: string | null
  canonical_organisation_id: string | null
}

export type BuyerMembershipSummary = {
  id: string
  status: BuyerMembershipStatus
  customer_id: string
}

export type BuyerOrganisationMembership = {
  organisation: BuyerOrganisationSummary | null
  membership: BuyerMembershipSummary
}

export type BuyerApplyInput = {
  legalName: string
  tradingName?: string
  registrationNumber?: string
  defaultMarketKey?: string
}
