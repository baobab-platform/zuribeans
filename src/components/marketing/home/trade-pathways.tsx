import { BriefcaseBusiness, Sprout, type LucideIcon } from "lucide-react"
import { SectionHeading } from "@/components/marketing/section-heading"
import { ButtonLink } from "@/components/ui/button"
import type { TradePathway, TradePathwayTone } from "@/lib/content/trade-pathways"
import { classNames } from "@/lib/ui/classnames"

const PATHWAY_ICONS: Record<TradePathwayTone, LucideIcon> = {
  buyer: BriefcaseBusiness,
  supplier: Sprout,
}

/**
 * Both procurement and supplier onboarding remain linked to their real route
 * and policy. These are presentation cards, not mock transaction controls.
 */
export function TradePathways({ pathways }: { pathways: readonly TradePathway[] }) {
  if (pathways.length === 0) return null

  return (
    <section className="bg-ink py-20 text-white lg:py-28" aria-label="Ways to trade with ZuriBeans">
      <div className="page-container">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeading
            eyebrow="Trade pathways"
            title="Two ways to work with ZuriBeans."
            tone="inverse"
          />
          <p className="max-w-xl text-base leading-7 text-white/75 lg:justify-self-end">
            Good trade starts with the right information. Buyers define a requirement; suppliers
            begin qualification. Each path has an accountable next step.
          </p>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-2">
          {pathways.map((pathway) => {
            const Icon = PATHWAY_ICONS[pathway.tone]
            const buyer = pathway.tone === "buyer"
            return (
              <article
                key={pathway.tone}
                className={classNames(
                  "flex min-h-80 flex-col p-7 sm:p-10 lg:p-12",
                  buyer ? "bg-ink-soft text-white" : "bg-surface text-ink",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={classNames(
                      "inline-flex size-12 items-center justify-center border",
                      buyer
                        ? "border-clay/50 text-clay-inverse"
                        : "border-line-strong text-clay-on-light",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span
                    className={classNames(
                      "text-xs font-semibold uppercase tracking-[0.14em]",
                      buyer ? "text-clay-inverse" : "text-clay-on-light",
                    )}
                  >
                    {pathway.audience}
                  </span>
                </div>
                <h3 className="mt-9 max-w-md font-display text-3xl font-normal leading-tight sm:text-4xl">
                  {pathway.title}
                </h3>
                <p
                  className={classNames(
                    "mt-5 max-w-lg leading-7",
                    buyer ? "text-white/75" : "text-muted",
                  )}
                >
                  {pathway.description}
                </p>
                <p
                  className={classNames(
                    "mt-6 border-t pt-4 text-sm leading-6",
                    buyer ? "border-white/15 text-white/70" : "border-line text-muted",
                  )}
                >
                  {pathway.note}
                </p>
                <ButtonLink
                  href={pathway.href}
                  variant={buyer ? "primary" : "outline"}
                  className={classNames(
                    "mt-8 min-h-12 self-start",
                    buyer && "bg-clay text-ink hover:bg-clay-inverse",
                  )}
                >
                  {pathway.actionLabel}
                </ButtonLink>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
