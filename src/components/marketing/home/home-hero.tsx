import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { MarketContextBadge } from "@/components/context/market-context-badge"
import { ButtonLink } from "@/components/ui/button"
import type { HomeHeroContent } from "@/lib/content/homepage"
import type { ZuribeansMarket } from "@/lib/market/markets"

/**
 * The Figma Make editorial hero: a single immersive image, deliberate dark
 * gradient, left-aligned message and an evidence cue. Content, market context
 * and destinations remain owned by the existing public estate.
 */
export function HomeHero({
  content,
  market,
}: {
  content: HomeHeroContent
  market: ZuribeansMarket
}) {
  return (
    <section className="relative isolate flex min-h-[min(48rem,calc(100svh-var(--header-utility-height)-var(--header-main-height)))] items-end overflow-hidden bg-ink text-white lg:min-h-[45rem]">
      <Image
        src={content.image.src}
        alt={content.image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,36,29,.94)_0%,rgba(8,36,29,.74)_43%,rgba(8,36,29,.30)_100%)] max-sm:bg-[linear-gradient(0deg,rgba(8,36,29,.96)_0%,rgba(8,36,29,.68)_65%,rgba(8,36,29,.42)_100%)]"
      />
      <div className="page-container relative z-10 grid gap-10 pb-16 pt-28 sm:pb-20 lg:grid-cols-12 lg:pb-24 lg:pt-36">
        <div className="lg:col-span-9 xl:col-span-8">
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <span className="eyebrow-inverse">{content.eyebrow}</span>
            <span className="h-px w-9 bg-clay" aria-hidden="true" />
            <span className="text-xs tracking-[.12em] text-white/70 uppercase">
              Professional B2B sourcing
            </span>
          </div>
          <h1 className="max-w-[14ch] font-display text-[clamp(2.65rem,6.6vw,5.25rem)] font-normal leading-[1.06] tracking-[-.025em] text-balance">
            {content.title} <em className="font-normal text-sand">{content.accent}</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 font-light text-white/80 sm:text-lg">
            {content.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink
              href={content.primaryCta.href}
              size="lg"
              className="bg-clay font-semibold text-ink hover:bg-clay-inverse"
            >
              {content.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href={content.secondaryCta.href}
              variant="outline"
              size="lg"
              className="border-white/50 text-white hover:bg-white/10"
            >
              {content.secondaryCta.label}
            </ButtonLink>
          </div>
          <div className="mt-8">
            <MarketContextBadge market={market} tone="inverse" />
          </div>
        </div>
        <div className="flex items-end lg:col-span-3 xl:col-span-4 lg:justify-end">
          <div className="max-w-xs border-l-2 border-clay pl-5">
            <p className="eyebrow-inverse">{content.evidence.eyebrow}</p>
            <p className="mt-3 font-display text-xl leading-snug text-white/90 sm:text-2xl">
              {content.evidence.statement}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
