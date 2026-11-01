import Image from "next/image"
import Link from "next/link"
import type { ProductCardVisual } from "@/lib/medusa/types"

/**
 * Shared Figma Make catalogue tile. Synthetic details are always visibly
 * marked as illustrative, never certified, sellable or binding. Real provider
 * cards render only the data that the provider actually published.
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
  cardFacts,
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
  cardFacts?: ProductCardVisual
}) {
  const synthetic = cardFacts?.source === "synthetic"
  const status = cardFacts?.supplyStatus
  const usableSampleImage = Boolean(
    synthetic && image?.startsWith("https://images.unsplash.com/"),
  )
  const rows = [
    { label: "Grade", value: cardFacts?.grade },
    { label: "Process", value: cardFacts?.process },
  ].filter((row) => row.value)

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
              unoptimized={usableSampleImage}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={objectPosition ? { objectPosition } : undefined}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#d9b88d,transparent_40%),linear-gradient(145deg,#526a4f,#172219)]">
              <span aria-hidden="true" className="font-display text-5xl text-white/80">Z</span>
            </div>
          )}
          {synthetic ? (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
              Sample data
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col" style={{ padding: "16px 16px 20px" }}>
          <p
            className="font-bold uppercase text-clay-on-light"
            style={{ fontSize: 10, letterSpacing: "0.12em", marginBottom: "6px" }}
          >
            {cardFacts?.category ?? eyebrow}
          </p>
          <h3 className="font-display font-normal text-ink" style={{ fontSize: "20px", lineHeight: 1.2 }}>
            {title}
          </h3>
          <p className="text-sm text-muted" style={{ marginTop: "4px", marginBottom: "14px" }}>
            {origin || "Origin details on request"}
          </p>
          <dl className="flex flex-1 flex-col" style={{ gap: "5px", marginBottom: "14px" }}>
            {rows.map((row) => (
              <div key={row.label} className="flex gap-2 border-b border-line" style={{ paddingBottom: "5px" }}>
                <dt className="shrink-0 text-xs text-muted" style={{ width: "64px" }}>
                  {row.label}
                </dt>
                <dd className="min-w-0 text-xs font-medium text-ink">{row.value}</dd>
              </div>
            ))}
            {rows.length === 0 && details ? (
              <div className="flex gap-2 border-b border-line" style={{ paddingBottom: "5px" }}>
                <dt className="shrink-0 text-xs text-muted" style={{ width: "64px" }}>Details</dt>
                <dd className="min-w-0 text-xs font-medium text-ink">{details}</dd>
              </div>
            ) : null}
          </dl>
          {cardFacts?.certification ? (
            <p className="text-xs font-semibold text-clay-on-light" style={{ marginBottom: "12px" }}>
              {synthetic ? "Sample evidence: " : "Published evidence: "}
              {cardFacts.certification}
            </p>
          ) : null}
          {synthetic && cardFacts?.minimumOrder ? (
            <p className="text-xs text-muted" style={{ marginBottom: "12px" }}>
              Illustrative terms: MOQ {cardFacts.minimumOrder}
              {cardFacts.incoterms ? " · " + cardFacts.incoterms : ""}
            </p>
          ) : null}
          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {status ? (
                <>
                  <span
                    aria-hidden="true"
                    className="shrink-0 rounded-full"
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor: status === "Limited" ? "#996600" : "var(--color-leaf)",
                    }}
                  />
                  <span className="text-xs font-semibold text-ink">
                    {status} {synthetic ? "(sample)" : ""}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted">Availability on request</span>
              )}
            </div>
            <span className="shrink-0 text-xs font-semibold text-ink underline underline-offset-4">
              {actionLabel} →
            </span>
          </div>
          {synthetic ? (
            <p className="mt-2 text-xs text-muted">
              Fictional preview; no verified certificate, stock or binding offer.
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
