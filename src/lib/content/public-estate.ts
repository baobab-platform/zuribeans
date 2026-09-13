import type { ZuribeansMarketKey } from "@/lib/market/markets"

export type PublicProductClass = {
  name: string
  description: string
  href: string
  eyebrow: string
  actionLabel: string
}

export const PUBLIC_PRODUCT_CLASSES: readonly PublicProductClass[] = [
  {
    name: "Green coffee",
    description:
      "Arabica, Robusta and specialty lots presented with origin and trade specifications.",
    href: "/products?category=coffee",
    eyebrow: "Core product class",
    actionLabel: "View the catalogue",
  },
  {
    name: "Vanilla pods",
    description:
      "Commercial vanilla supply with origin, grade and capacity information where published.",
    href: "/products?category=vanilla",
    eyebrow: "Growing product class",
    actionLabel: "View the catalogue",
  },
]

export type PublicMarketSummary = {
  marketKey: ZuribeansMarketKey
  role: string
  summary: string
}

export const PUBLIC_MARKET_SUMMARIES: readonly PublicMarketSummary[] = [
  {
    marketKey: "zuribeans_ug",
    role: "Origin and export market",
    summary: "Sourcing relationships, product preparation, traceability and export capability.",
  },
  {
    marketKey: "zuribeans_za",
    role: "Import and distribution market",
    summary: "Professional buyer service, market distribution and cross-border trade coordination.",
  },
]

export const TRADE_STEPS = [
  {
    number: "01",
    title: "Define the requirement",
    description:
      "Product, specification, volume, destination and timing are established before terms are proposed.",
  },
  {
    number: "02",
    title: "Confirm the commercial basis",
    description:
      "Availability, eligibility and terms come from the authoritative trading systems—not a browser estimate.",
  },
  {
    number: "03",
    title: "Prepare and move the goods",
    description:
      "Quality, documentation and logistics are coordinated against the agreed transaction and trade lane.",
  },
  {
    number: "04",
    title: "Preserve the record",
    description:
      "Order, shipment and financial state remain connected for accountable repeat trade.",
  },
] as const
