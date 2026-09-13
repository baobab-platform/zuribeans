export const BUYER_CAPABILITY_KEYS = [
  "organisation",
  "team",
  "catalogue",
  "orders",
  "documents",
] as const

export type BuyerCapabilityKey = (typeof BUYER_CAPABILITY_KEYS)[number]

export type BuyerCapabilitySnapshot = Readonly<Partial<Record<BuyerCapabilityKey, boolean>>>

export type BuyerPortalSection = {
  key: BuyerCapabilityKey
  label: string
  href: string
  description: string
}

const BUYER_PORTAL_SECTIONS: readonly BuyerPortalSection[] = [
  {
    key: "organisation",
    label: "Company",
    href: "/account/company",
    description: "Organisation profile and trading-account details.",
  },
  {
    key: "team",
    label: "Team",
    href: "/account/team",
    description: "Members, roles and purchasing authorities.",
  },
  {
    key: "catalogue",
    label: "Catalogue",
    href: "/account/catalogue",
    description: "Eligible products, availability and account pricing.",
  },
  {
    key: "orders",
    label: "Orders",
    href: "/account/orders",
    description: "Approved orders and their commercial status.",
  },
  {
    key: "documents",
    label: "Documents",
    href: "/account/documents",
    description: "Buyer-visible transaction and trade documents.",
  },
]

export type BuyerNavigationItem = {
  label: string
  href: string
}

export const getBuyerNavigation = (
  capabilities: BuyerCapabilitySnapshot | null,
): readonly BuyerNavigationItem[] => [
  { label: "Overview", href: "/account" },
  ...BUYER_PORTAL_SECTIONS.filter(({ key }) => capabilities?.[key] === true).map(
    ({ label, href }) => ({ label, href }),
  ),
]

export const getUnavailableBuyerSections = (
  capabilities: BuyerCapabilitySnapshot | null,
): readonly BuyerPortalSection[] =>
  BUYER_PORTAL_SECTIONS.filter(({ key }) => capabilities?.[key] !== true)
