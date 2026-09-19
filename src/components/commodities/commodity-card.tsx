import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { CommodityPresentation } from "@/lib/content/commodity"

type CommodityCardProps = {
  commodity: CommodityPresentation
}

export function CommodityCard({ commodity }: CommodityCardProps) {
  return (
    <Link
      href={commodity.href}
      className="group block h-full rounded-panel focus-visible:outline-offset-4"
      aria-label={`${commodity.actionLabel}: ${commodity.name}`}
    >
      <article className="h-full overflow-hidden rounded-panel border border-line bg-surface-raised shadow-panel transition-transform group-hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden bg-sand">
          <Image
            src={commodity.image.src}
            alt={commodity.image.alt}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            style={{ objectPosition: commodity.image.position }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"
            aria-hidden="true"
          />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-ink/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {commodity.contextLabel}
          </span>
        </div>
        <div className="p-7 md:p-8">
          <p className="eyebrow">{commodity.eyebrow}</p>
          <h3 className="mt-4 font-display text-3xl">{commodity.name}</h3>
          <p className="mt-4 leading-7 text-muted">{commodity.description}</p>
          <span className="mt-7 inline-flex items-center gap-2 font-semibold text-clay-on-light">
            {commodity.actionLabel}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </article>
    </Link>
  )
}
