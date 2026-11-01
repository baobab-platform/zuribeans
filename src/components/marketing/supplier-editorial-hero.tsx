import Link from "next/link"

/**
 * Figma Make public-page editorial hero for supplier acquisition.
 * The same ink panel, breadcrumb, serif hierarchy and restrained orbital
 * motif are used by /sourcing and /sourcing/become-a-supplier.
 * No product, certification or supplier approval is asserted here.
 */
export function SupplierEditorialHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="relative overflow-hidden bg-ink text-canvas">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-52 size-[420px] rounded-full border border-clay/20"
      />
      <div className="page-container relative z-10 py-[clamp(54px,8vw,104px)]">
        <nav
          aria-label="Breadcrumb"
          className="mb-9 flex flex-wrap items-center gap-2 text-xs tracking-[.08em] text-canvas/65"
        >
          <Link href="/" className="min-h-8 py-2 hover:text-canvas hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <p className="eyebrow-inverse mb-4">{eyebrow}</p>
        <h1 className="max-w-[900px] font-display text-[clamp(38px,6.5vw,76px)] font-light leading-[1.02] tracking-[-.025em] text-canvas">
          {title}
        </h1>
        <p className="mt-6 max-w-[720px] text-[clamp(15px,2vw,18px)] leading-[1.7] text-canvas/75">
          {description}
        </p>
      </div>
    </header>
  )
}
