export type TradeStepIcon = "requirement" | "verification" | "agreement" | "delivery"

export type TradeStepPresentation = {
  number: string
  title: string
  description: string
  icon: TradeStepIcon
}
