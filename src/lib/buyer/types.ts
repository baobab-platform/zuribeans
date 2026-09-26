export type BuyerOrganisationStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED"

export type BuyerApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "INFORMATION_REQUIRED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN"

export type BuyerApplicationSummary = {
  id: string
  status: BuyerApplicationStatus
  legal_name: string
  trading_name: string | null
  registration_number: string | null
  country_of_registration: string | null
  requested_market_keys: string[]
  submitted_at: string | null
  revision: number
}

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
  idempotencyKey: string
  legalName: string
  tradingName?: string
  registrationNumber?: string
  countryOfRegistration?: string
  requestedMarketKeys: string[]
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

export type BuyerDeliverySite = {
  id: string
  market_key: string
  code: string
  name: string
  status: string
  address_1: string
  address_2?: string | null
  city: string
  province?: string | null
  postal_code?: string | null
  country_code: string
  contact_name?: string | null
  contact_phone?: string | null
  allow_shipping: boolean
  allow_billing: boolean
}

export type BuyerAccountRelationships = {
  applications: BuyerApplicationSummary[]
  organisations: BuyerOrganisationMembership[]
}
