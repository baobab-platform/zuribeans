import { ClipboardList, Handshake, SearchCheck, Truck, type LucideIcon } from "lucide-react"
import { SectionHeading } from "@/components/marketing/section-heading"
import type { TradeStepIcon, TradeStepPresentation } from "@/lib/content/trade"

const STEP_ICONS: Record<TradeStepIcon, LucideIcon> = {
  requirement: ClipboardList,
  verification: SearchCheck,
  agreement: Handshake,
  delivery: Truck,
}

type TradeProcessProps = {
  steps: readonly TradeStepPresentation[]
}

export function TradeProcess({ steps }: TradeProcessProps) {
  if (steps.length === 0) {
    return null
  }

  return (
    <section className="page-container py-24 lg:py-32" aria-label="How ZuriBeans trades">
      <SectionHeading
        eyebrow="How ZuriBeans trades"
        title="Simple to follow. Disciplined in execution."
        description="A clear commercial path from a defined requirement to accountable delivery and a preserved transaction record."
      />
      <ol className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon]

          return (
            <li
              key={step.number}
              className="relative rounded-panel border border-line bg-surface-raised p-7 shadow-control"
            >
              {index < steps.length - 1 ? (
                <span
                  className="absolute left-[calc(100%+0.25rem)] top-12 hidden h-px w-[calc(1.5rem-0.5rem)] bg-line-strong lg:block"
                  aria-hidden="true"
                />
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-ink text-clay">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="font-display text-4xl text-sand" aria-hidden="true">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
