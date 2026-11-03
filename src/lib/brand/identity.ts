/**
 * Approved ZuriBeans Figma Make trade-house identity. Shared BXS owns neutral
 * semantic roles; this estate owns its brand and customer-facing journeys.
 * Editorial descriptions are not legal or transactional authority evidence.
 */
export const ZURIBEANS_IDENTITY = {
  name: "ZuriBeans",
  group: "Nabhold Group Africa",
  category: "African B2B commodity trading",
  descriptor: "Agricultural commodities · sourcing · cross-border trade",
  promise: "African origin. International trade discipline.",
  typography: {
    editorial: "Source Serif 4",
    interface: "Source Sans 3",
  },
  journeys: {
    public: {
      label: "Commodity trade house",
      description: "Product origins, specifications and accountable trade.",
      entry: "/products",
    },
    buyer: {
      label: "Buyer procurement",
      description: "Source and specify commodities for professional purchasing.",
      entry: "/buyer",
    },
    supplier: {
      label: "Supplier sourcing",
      description: "Present origin, capacity and quality evidence for review.",
      entry: "/sourcing/become-a-supplier",
    },
  },
} as const

export type TradeHouseAudience = keyof typeof ZURIBEANS_IDENTITY.journeys
