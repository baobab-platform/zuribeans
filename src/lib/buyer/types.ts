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

export type BuyerTeamMember = {
  id: string
  customer_id: string
  principal_id: string
  status: BuyerMembershipStatus
  invited_email: string | null
  invitation_accepted_at: string | null
  roles: string[]
}

export type BuyerTaxRegistration = {
  id: string
  market_key: string
  country_code: string
  registration_type: string
  registration_number: string
  status: string
  verified_at?: string | null
  expires_at?: string | null
}
