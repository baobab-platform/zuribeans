import Image from "next/image"
import Link from "next/link"

/**
 * Shared Figma Make catalogue tile, without prototype claims about certificates,
 * availability, grade or shipment readiness. Every displayed fact is supplied
 * by the caller's published-product or curated product-class source.
 */
export function CatalogueTile({
  href,
  title,
  eyebrow,
  origin,
  details,
  image,
  imageAlt = "",
  objectPosition,
  actionLabel = "View product",
}: {
  href: string
  title: string
  eyebrow: string
  origin?: string | null
  details?: string | null
  image?: string | null
  imageAlt?: string
  objectPosition?: string
  actionLabel?: string
}) {
  return (
    <article className="group flex min-w-0 flex-col bg-canvas transition-colors hover:bg-surface">
      <Link
        href={href}
        className="flex h-full min-w-0 flex-col focus-visible:outline-offset-4"
        aria-label={actionLabel + ": " + title}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={objectPosition ? { objectPosition } : undefined}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#d9b88d,transparent_40%),linear-gradient(145deg,#526a4f,#172219)]">
              <span aria-hidden="true" className="font-display text-5xl text-white/80">
                Z
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col" style={{ padding: "16px 16px 20px" }}>
          <p
            className="font-bold uppercase text-clay-on-light"
            style={{ fontSize: 11, letterSpacing: "0.12em", marginBottom: "6px" }}
          >
            {eyebrow}
          </p>
          <h3 className="font-display font-normal text-ink" style={{ fontSize: "20px", lineHeight: 1.2 }}>
            {title}
          </h3>
          <p className="text-sm text-muted" style={{ marginTop: "4px", marginBottom: "14px" }}>
            {origin || "Origin details on request"}
          </p>
          <dl className="flex flex-1 flex-col" style={{ gap: "5px", marginBottom: "16px" }}>
            {details ? (
              <div className="flex gap-2 border-b border-line" style={{ paddingBottom: "6px" }}>
                <dt className="shrink-0 text-xs text-muted" style={{ width: "62px" }}>
                  Details
                </dt>
                <dd className="min-w-0 text-xs font-medium text-ink">{details}</dd>
              </div>
            ) : null}
          </dl>
          <span className="mt-auto flex items-center justify-between border-t border-line font-semibold text-ink" style={{ paddingTop: "12px", fontSize: "13px" }}>
            <span>Product information</span>
            <span className="underline underline-offset-4">{actionLabel} →</span>
          </span>
        </div>
      </Link>
    </article>
  )
}
