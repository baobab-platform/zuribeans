import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { MarketContextBadge } from "@/components/context/market-context-badge"
import { ButtonLink } from "@/components/ui/button"
import type { HomeHeroContent } from "@/lib/content/homepage"
import type { ZuribeansMarket } from "@/lib/market/markets"

type HomeHeroProps = {
  content: HomeHeroContent
  market: ZuribeansMarket
}

export function HomeHero({ content, market }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div
        className="page-container grid min-h-[calc(100svh-var(--header-utility-height)-var(--header-main-height))] items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20"
      >
        <div className="relative z-10 lg:py-10">
          <p className="eyebrow-inverse">{content.eyebrow}</p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {content.title} <span className="text-clay">{content.accent}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
            {content.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink
              href={content.primaryCta.href}
              size="lg"
              className="bg-clay text-ink hover:bg-clay-inverse"
            >
              {content.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href={content.secondaryCta.href}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              {content.secondaryCta.label}
            </ButtonLink>
          </div>
          <div className="mt-8">
            <MarketContextBadge market={market} tone="inverse" />
          </div>
        </div>

        <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-soft shadow-panel sm:min-h-[34rem]">
          <Image
            src={content.image.src}
            alt={content.image.alt}
            fill
            priority
            sizes="(min-width: 1280px) 704px, (min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-panel border border-white/20 bg-ink/80 p-5 text-white backdrop-blur-sm sm:inset-x-7 sm:bottom-7 sm:p-6">
            <p className="eyebrow-inverse">{content.evidence.eyebrow}</p>
            <p className="mt-2 max-w-xl font-display text-2xl sm:text-3xl">
              {content.evidence.statement}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
