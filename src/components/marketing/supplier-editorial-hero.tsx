import Link from "next/link"

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
        className="pointer-events-none absolute rounded-full"
        style={{
          right: "-7rem",
          top: "-13rem",
          width: 420,
          height: 420,
          border: "1px solid rgb(201 162 39 / 0.2)",
        }}
      />
      <div
        className="page-container relative z-10"
        style={{ paddingBlock: "clamp(54px, 8vw, 104px)" }}
      >
        <nav
          aria-label="Breadcrumb"
          className="mb-9 flex flex-wrap items-center gap-2 text-xs text-canvas/65"
          style={{ letterSpacing: "0.08em" }}
        >
          <Link href="/" className="min-h-8 py-2 hover:text-canvas hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{eyebrow}</span>
        </nav>
        <p className="eyebrow-inverse mb-4">{eyebrow}</p>
        <h1
          className="font-display font-light text-canvas"
          style={{
            maxWidth: 900,
            fontSize: "clamp(38px, 6.5vw, 76px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
          }}
        >
          {title}
        </h1>
        <p
          className="mt-6 text-canvas/75"
          style={{ maxWidth: 720, fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.7 }}
        >
          {description}
        </p>
      </div>
    </header>
  )
}
