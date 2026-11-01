import Link from "next/link"

type SupplierPortalEntryProps = {
  eyebrow?: string
  title?: string
  description?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  preview?: boolean
}

/**
 * Port of Figma Make's PortalEntry supplier variant. Navigation remains Next.js
 * App Router links, not the prototype's in-memory route state.
 */
export function SupplierPortalEntry({
  eyebrow = "Supplier portal",
  title = "Manage your supplier relationship.",
  description = "The supplier workspace is separate from buyer accounts and supports applications, evidence requests and qualification updates.",
  primaryHref = "/supplier/apply",
  primaryLabel = "Start supplier application",
  secondaryHref = "/sourcing",
  secondaryLabel = "Review supplier requirements",
  preview = false,
}: SupplierPortalEntryProps) {
  return (
    <div className="grid min-h-[65vh] bg-canvas lg:grid-cols-2">
      <section
        className="flex min-h-80 flex-col justify-between bg-ink text-canvas"
        style={{ padding: "clamp(28px, 6vw, 72px)" }}
      >
        <Link href="/" className="flex items-center gap-3 self-start" aria-label="ZuriBeans homepage">
          <span className="grid size-7 place-items-center rounded bg-clay text-xs font-bold text-ink">ZB</span>
          <span className="font-display text-xl">ZuriBeans</span>
        </Link>
        <div className="mt-16 max-w-xl">
          <p className="eyebrow-inverse">{eyebrow}</p>
          <h1 className="mt-4 font-display font-light leading-tight" style={{ fontSize: "clamp(38px, 6vw, 64px)", letterSpacing: "-.025em" }}>
            {title}
          </h1>
          {preview ? <p className="mt-5 text-sm text-clay-inverse">Synthetic supplier preview — development only</p> : null}
        </div>
      </section>
      <section className="flex items-center" style={{ padding: "clamp(32px, 7vw, 88px)" }}>
        <div className="w-full max-w-lg border-t-4 border-clay pt-7">
          <p className="text-base leading-8 text-muted">{description}</p>
          <Link
            href={primaryHref}
            className="mt-8 flex min-h-12 items-center justify-center rounded-control bg-ink px-5 py-3 text-center text-sm font-bold text-canvas"
          >
            {primaryLabel}
          </Link>
          <Link href={secondaryHref} className="mt-4 flex min-h-12 items-center justify-center text-center text-sm font-semibold underline underline-offset-4">
            {secondaryLabel} →
          </Link>
          <p className="mt-5 text-xs leading-5 text-muted">Application review does not create supplier approval, buyer access or an active mandate.</p>
        </div>
      </section>
    </div>
  )
}
