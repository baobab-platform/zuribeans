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
    <div className="grid bg-canvas lg:grid-cols-2" style={{ minHeight: "65vh" }}>
      <section
        className="flex flex-col justify-between bg-ink text-canvas"
        style={{ padding: "clamp(28px, 6vw, 72px)", minHeight: "20rem" }}
      >
        <Link
          href="/"
          className="flex items-center"
          style={{ gap: "0.75rem", alignSelf: "flex-start" }}
          aria-label="ZuriBeans homepage"
        >
          <span
            className="grid place-items-center bg-clay text-xs font-bold text-ink"
            style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.25rem" }}
          >
            ZB
          </span>
          <span className="font-display text-xl">ZuriBeans</span>
        </Link>
        <div style={{ marginTop: "4rem", maxWidth: "36rem" }}>
          <p className="eyebrow-inverse">{eyebrow}</p>
          <h1
            className="mt-4 font-display font-light leading-tight"
            style={{ fontSize: "clamp(38px, 6vw, 64px)", letterSpacing: "-.025em" }}
          >
            {title}
          </h1>
          {preview ? (
            <p className="mt-5 text-sm text-clay-inverse">
              Synthetic supplier preview — development only
            </p>
          ) : null}
        </div>
      </section>
      <section className="flex items-center" style={{ padding: "clamp(32px, 7vw, 88px)" }}>
        <div
          className="w-full border-clay"
          style={{ maxWidth: "32rem", borderTopWidth: "4px", paddingTop: "1.75rem" }}
        >
          <p className="text-base text-muted" style={{ lineHeight: "2rem" }}>
            {description}
          </p>
          <Link
            href={primaryHref}
            className="flex min-h-12 items-center justify-center rounded-control bg-ink px-5 py-3 text-center text-sm font-bold text-canvas"
            style={{ marginTop: "2rem" }}
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="flex min-h-12 items-center justify-center text-center text-sm font-semibold underline"
            style={{ marginTop: "1rem", textUnderlineOffset: "0.25rem" }}
          >
            {secondaryLabel} →
          </Link>
          <p className="text-xs text-muted" style={{ marginTop: "1.25rem", lineHeight: "1.25rem" }}>
            Application review does not create supplier approval, buyer access or an active mandate.
          </p>
        </div>
      </section>
    </div>
  )
}
