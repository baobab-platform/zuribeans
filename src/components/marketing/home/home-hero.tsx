import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MarketContextBadge } from "@/components/context/market-context-badge"
import type { HomeHeroContent } from "@/lib/content/homepage"
import type { ZuribeansMarket } from "@/lib/market/markets"

/**
 * Composition follows the Figma Make Hero.tsx layout:
 * - art-directed portrait crop on phones
 * - dark, bottom-weighted overlay instead of a lateral gradient
 * - three-line serif statement with an italic middle line
 * - procurement CTA group and the three-value right-side statistics rail.
 *
 * Figures are design content in development. Source verification is a separate
 * staging/production release gate, documented outside the rendered interface.
 */
export function HomeHero({
  content,
  market,
}: {
  content: HomeHeroContent
  market: ZuribeansMarket
}) {
  return (
    <section
      aria-labelledby="zuribeans-home-title"
      className="relative isolate flex min-h-[610px] items-end overflow-hidden bg-ink text-white sm:min-h-[650px] lg:min-h-[710px]"
    >
      <Image
        src={content.image.src}
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 100vw, 100vw"
        className="object-cover object-[center_20%] opacity-30 sm:object-[center_30%] sm:opacity-35"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,44,36,.25)_0%,rgba(15,44,36,.60)_45%,rgba(15,44,36,.96)_100%)]"
      />
      <div className="page-container relative z-10 min-w-0 max-w-full pb-12 pt-20 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-36">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-5 flex items-center gap-3 sm:mb-9">
              <span className="eyebrow-inverse !text-[11px] !tracking-[.16em]">
                {content.eyebrow}
              </span>
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-clay" />
              <span className="hidden text-[11px] uppercase tracking-[.1em] text-white/60 sm:inline">
                Professional B2B sourcing
              </span>
            </div>

            <h1
              id="zuribeans-home-title"
              className="max-w-[860px] font-display text-[clamp(38px,6.5vw,78px)] font-light leading-[1.07] tracking-[-.02em] text-canvas"
            >
              African origin.
              <span className="block">
                <em className="font-light text-sand">International</em>
              </span>
              <span className="block">trade discipline.</span>
            </h1>

            <p className="mt-5 max-w-[520px] text-[15px] font-light leading-[1.65] text-white/75 sm:mt-7 sm:text-lg">
              {content.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-10">
              <Link
                href={content.primaryCta.href}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-clay px-6 py-3 text-sm font-bold tracking-[.04em] text-ink transition-opacity hover:opacity-90"
                style={{ color: "var(--color-ink)" }}
              >
                {content.primaryCta.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={content.secondaryCta.href}
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-white/40 px-6 py-3 text-sm font-medium tracking-[.03em] text-white transition-colors hover:bg-white/10"
              >
                {content.secondaryCta.label}
              </Link>
            </div>
            <div className="mt-6">
              <MarketContextBadge market={market} tone="inverse" />
            </div>
          </div>

          <aside
            aria-label="Trade at a glance"
            className="hidden flex-col justify-end gap-5 lg:col-span-4 lg:flex"
          >
            <dl className="space-y-5">
              {content.illustrativeMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col border-l-2 border-clay-inverse pl-4"
                >
                  <dt className="order-2 mt-2 text-xs font-bold tracking-[.06em] text-clay-inverse uppercase">
                    {metric.label}
                  </dt>
                  <dd className="order-1 font-display text-4xl font-light leading-none text-white">
                    {metric.value}
                  </dd>
                  <dd className="order-3 mt-1 text-xs leading-relaxed text-white/75">
                    {metric.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}
