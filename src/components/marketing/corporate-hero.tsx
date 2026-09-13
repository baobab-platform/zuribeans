import Image from "next/image"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs"

type CorporateHeroProps = {
  eyebrow: string
  title: string
  description: string
  breadcrumbs: readonly BreadcrumbItem[]
  image?: {
    src: string
    alt: string
    position?: string
  }
}

export function CorporateHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  image,
}: CorporateHeroProps) {
  return (
    <section className="page-container py-12 lg:py-16">
      <Breadcrumbs items={breadcrumbs} />
      <div
        className={`mt-8 grid gap-10 ${image ? "lg:grid-cols-[.9fr_1.1fr] lg:items-center" : ""}`}
      >
        <div className="max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-balance md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{description}</p>
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-sand">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
              style={{ objectPosition: image.position }}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
