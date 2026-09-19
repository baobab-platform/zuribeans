import { BriefcaseBusiness, Sprout, type LucideIcon } from "lucide-react"
import { SectionHeading } from "@/components/marketing/section-heading"
import { ButtonLink } from "@/components/ui/button"
import type { TradePathway, TradePathwayTone } from "@/lib/content/trade-pathways"
import { classNames } from "@/lib/ui/classnames"

const PATHWAY_ICONS: Record<TradePathwayTone, LucideIcon> = {
  buyer: BriefcaseBusiness,
  supplier: Sprout,
}

export function TradePathways({ pathways }: { pathways: readonly TradePathway[] }) {
  if (pathways.length === 0) {
    return null
  }

  return (
    <section className="page-container py-24 lg:py-32" aria-label="Ways to trade with ZuriBeans">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <SectionHeading
          eyebrow="Ready to trade?"
          title="Choose the conversation that fits your role."
        />
        <p className="max-w-xl justify-self-end text-base leading-7 text-muted">
          Good trade starts with the right information. Buyers define a requirement; suppliers begin
          a qualification process. Each path has a clear next step.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {pathways.map((pathway) => {
          const Icon = PATHWAY_ICONS[pathway.tone]
          const inverse = pathway.tone === "buyer"

          return (
            <article
              key={pathway.tone}
              className={classNames(
                "group relative flex min-h-[420px] flex-col overflow-hidden rounded-panel border p-8 shadow-panel md:p-10",
                inverse ? "border-ink bg-ink text-white" : "border-line bg-surface-raised text-ink",
              )}
            >
              <div
                className={classNames(
                  "absolute -right-20 -top-20 size-64 rounded-full transition-transform duration-500 group-hover:scale-110",
                  inverse ? "bg-white/5" : "bg-sand/60",
                )}
                aria-hidden="true"
              />
              <div
                className={classNames(
                  "relative flex size-14 items-center justify-center rounded-full border",
                  inverse
                    ? "border-white/15 bg-white/10 text-clay-inverse"
                    : "border-clay/30 bg-clay/10 text-clay-on-light",
                )}
              >
                <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
              </div>
              <p
                className={classNames(
                  "relative mt-9 text-xs font-bold uppercase tracking-[0.18em]",
                  inverse ? "text-clay-inverse" : "text-clay-on-light",
                )}
              >
                {pathway.audience}
              </p>
              <h3 className="relative mt-4 max-w-lg font-display text-4xl leading-tight md:text-5xl">
                {pathway.title}
              </h3>
              <p
                className={classNames(
                  "relative mt-5 max-w-xl leading-7",
                  inverse ? "text-white/75" : "text-muted",
                )}
              >
                {pathway.description}
              </p>
              <p
                className={classNames(
                  "relative mt-7 border-t pt-4 text-xs leading-5",
                  inverse ? "border-white/10 text-white/65" : "border-line text-muted",
                )}
              >
                {pathway.note}
              </p>
              <ButtonLink
                href={pathway.href}
                variant={inverse ? "primary" : "outline"}
                className={classNames(
                  "relative mt-auto self-start",
                  inverse && "bg-clay text-ink hover:bg-clay-inverse",
                )}
              >
                {pathway.actionLabel}
              </ButtonLink>
            </article>
          )
        })}
      </div>
    </section>
  )
}
