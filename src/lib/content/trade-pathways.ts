export type TradePathwayTone = "buyer" | "supplier"

export type TradePathway = {
  audience: string
  title: string
  description: string
  href: string
  actionLabel: string
  tone: TradePathwayTone
  note: string
}

export const TRADE_PATHWAYS = [
  {
    audience: "For professional buyers",
    title: "Bring us a real requirement.",
    description:
      "Tell the trade desk what you need to source, where it must arrive and when. Commercial terms follow the requirement—not a browser estimate.",
    href: "/contact",
    actionLabel: "Request a quote",
    tone: "buyer",
    note: "Product · specification · volume · destination · timing",
  },
  {
    audience: "For suppliers",
    title: "Build a qualified supply relationship.",
    description:
      "Declare product, origin, capacity and certification information for review. Submission begins qualification; it does not create automatic approval.",
    href: "/sourcing/become-a-supplier",
    actionLabel: "Review supplier requirements",
    tone: "supplier",
    note: "Product · origin · capacity · evidence · review",
  },
] as const satisfies readonly TradePathway[]
