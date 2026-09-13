import type { ZuribeansMarketKey } from "@/lib/market/markets"

export const MARKET_CAPABILITY = [
  {
    marketKey: "zuribeans_ug",
    operatingRole: "Origin and export coordination",
    description:
      "Supplier engagement, product context, preparation requirements, provenance and export coordination.",
    focus: ["Supplier relationships", "Origin information", "Export readiness"],
  },
  {
    marketKey: "zuribeans_za",
    operatingRole: "Import and buyer service",
    description:
      "Buyer requirements, market distribution context and coordination of cross-border supply.",
    focus: ["Buyer service", "Market distribution", "Import coordination"],
  },
] as const satisfies ReadonlyArray<{
  marketKey: ZuribeansMarketKey
  operatingRole: string
  description: string
  focus: readonly string[]
}>

export const TRADE_RESPONSIBILITIES = [
  {
    title: "Requirement",
    detail:
      "Product, specification, volume, destination and timing define the commercial question.",
  },
  {
    title: "Commercial confirmation",
    detail:
      "Trade systems confirm eligibility, price, availability and applicable terms for the market and account.",
  },
  {
    title: "Execution",
    detail:
      "Product preparation, documentation and logistics are coordinated against the agreed transaction.",
  },
  {
    title: "Record",
    detail:
      "Order, shipment and financial state remain connected in the systems responsible for them.",
  },
] as const

export const QUALITY_LAYERS = [
  {
    title: "Declared",
    detail: "Information supplied by a producer, cooperative, exporter or other counterparty.",
  },
  {
    title: "Reviewed",
    detail: "Information assessed during ZuriBeans qualification or trade preparation.",
  },
  {
    title: "Verified",
    detail: "Evidence tied to a defined verification source, document or responsible party.",
  },
  {
    title: "Transaction-specific",
    detail: "Quality and documentation requirements agreed for a particular commercial movement.",
  },
] as const
