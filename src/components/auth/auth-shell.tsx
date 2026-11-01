import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Shared Figma Make portal-entry composition. Buyer/supplier copy and form
 * actions stay separate; no authentication or organisation approval happens
 * in this layout component.
 */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-[min(780px,90vh)] bg-canvas lg:grid-cols-2">
      <section
        className="flex min-h-80 flex-col justify-between bg-ink text-canvas"
        style={{ padding: "clamp(28px, 6vw, 72px)" }}
      >
        <Link
          href="/"
          aria-label="ZuriBeans homepage"
          className="inline-flex items-center gap-3 self-start text-canvas"
        >
          <span className="grid size-8 place-items-center rounded-control bg-clay text-xs font-bold text-ink">
            ZB
          </span>
          <span className="font-display text-xl">ZuriBeans</span>
        </Link>
        <div className="mt-16 max-w-xl">
          <p className="eyebrow-inverse">{eyebrow}</p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-[1.07] tracking-[-.025em] text-canvas text-balance">
            {title}
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-canvas/80">
            Procurement and sourcing are independently governed journeys.
          </p>
        </div>
      </section>
      <section
        className="flex items-center px-6 py-12 sm:px-12 lg:px-[clamp(36px,6vw,88px)]"
        aria-label="Portal credentials"
      >
        <div className="mx-auto w-full max-w-lg border-t-4 border-clay pt-8">
          <p className="mb-9 text-base leading-8 text-muted">{description}</p>
          {children}
        </div>
      </section>
    </div>
  )
}
