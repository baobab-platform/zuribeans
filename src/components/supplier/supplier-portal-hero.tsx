import Link from "next/link"

/**
 * Make PortalEntry (/supplier) visual port, with real Next.js links and no
 * client-side pseudo-navigation. Authentication remains with supplier/layout.
 */
export function SupplierPortalHero({ hasApplication }: { hasApplication: boolean }) {
  return (
    <div className="grid overflow-hidden rounded-panel border border-line lg:grid-cols-2">
      <section
        className="flex min-h-80 flex-col justify-between bg-ink text-canvas"
        style={{ padding: "clamp(28px, 6vw, 64px)" }}
      >
        <Link href="/" className="flex items-center gap-3 self-start">
          <span className="grid size-8 place-items-center rounded bg-clay text-xs font-bold text-ink">ZB</span>
          <span className="font-display text-xl">ZuriBeans</span>
        </Link>
        <div className="mt-16 max-w-xl">
          <p className="eyebrow-inverse">Supplier portal</p>
          <h2 className="mt-5 font-display font-light" style={{ fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.06, letterSpacing: "-.025em" }}>
            Manage your supplier relationship.
          </h2>
        </div>
      </section>
      <section className="flex items-center bg-canvas" style={{ padding: "clamp(32px, 6vw, 72px)" }}>
        <div className="w-full border-t-4 border-clay pt-7">
          <p className="text-base leading-8 text-muted">
            The supplier workspace is separate from buyer accounts. It supports structured
            applications, review feedback and qualification updates through the sourcing team.
          </p>
          <Link
            href={hasApplication ? "/supplier" : "/supplier/apply"}
            className="mt-8 flex min-h-12 items-center justify-center rounded-control bg-ink px-5 text-sm font-bold text-white"
          >
            {hasApplication ? "View application status" : "Start supplier application"}
          </Link>
          <Link
            href="/sourcing/become-a-supplier"
            className="mt-5 block min-h-11 py-3 text-center text-sm font-semibold text-ink"
          >
            Review supplier requirements →
          </Link>
        </div>
      </section>
    </div>
  )
}
