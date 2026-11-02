import type { CommodityPresentation } from "@/lib/content/commodity"
import type { TradeStepPresentation } from "@/lib/content/trade"
import type { ZuribeansMarketKey } from "@/lib/market/markets"

export type PublicProductClass = CommodityPresentation

export const PUBLIC_PRODUCT_CLASSES = [
  {
    id: "robusta-coffee",
    name: "Robusta coffee",
    description:
      "Robusta green-coffee specifications and origin classes; individual lots require publication.",
    href: "/products?category=coffee",
    eyebrow: "Coffee product class",
    actionLabel: "View coffee",
    contextLabel: "African origins",
    image: {
      src: "/images/commodities/robusta-coffee.webp",
      alt: "Robusta coffee commodity category illustration",
      position: "72% center",
    },
  },
  {
    id: "arabica-coffee",
    name: "Arabica coffee",
    description:
      "Arabica green-coffee grades and origin information, subject to verified publications.",
    href: "/products?category=coffee",
    eyebrow: "Coffee product class",
    actionLabel: "View coffee",
    contextLabel: "African origins",
    image: {
      src: "/images/commodities/arabica-coffee.webp",
      alt: "Arabica coffee commodity category illustration",
      position: "55% center",
    },
  },
  {
    id: "vanilla-pods",
    name: "Vanilla pods",
    description:
      "Commercial vanilla supply with origin, grade and capacity information where published.",
    href: "/products?category=vanilla",
    eyebrow: "Growing product class",
    actionLabel: "View vanilla",
    contextLabel: "Origin-led supply",
    image: {
      src: "/images/commodities/vanilla-pods.webp",
      alt: "Vanilla pods alongside export-ready agricultural commodities",
      position: "42% center",
    },
  },
  {
    id: "sesame-seeds",
    name: "Sesame seeds",
    description:
      "Sesame and oilseed procurement classes; lot grades and stock are confirmed by providers.",
    href: "/products?category=sesame",
    eyebrow: "Grains and seeds",
    actionLabel: "View grains and seeds",
    contextLabel: "African origins",
    image: {
      src: "/images/commodities/sesame-seeds.webp",
      alt: "Agricultural commodity category illustration for sesame seeds",
      position: "25% center",
    },
  },
] as const satisfies readonly PublicProductClass[]

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
    icon: "requirement",
  },
  {
    number: "02",
    title: "Confirm the commercial basis",
    description:
      "Availability, eligibility and terms come from the authoritative trading systems—not a browser estimate.",
    icon: "verification",
  },
  {
    number: "03",
    title: "Prepare and move the goods",
    description:
      "Quality, documentation and logistics are coordinated against the agreed transaction and trade lane.",
    icon: "agreement",
  },
  {
    number: "04",
    title: "Preserve the record",
    description:
      "Order, shipment and financial state remain connected for accountable repeat trade.",
    icon: "delivery",
  },
] as const satisfies readonly TradeStepPresentation[]
