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
    <div className="grid h-[calc(100svh-4.5rem)] min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-canvas lg:grid-cols-2 lg:grid-rows-1 xl:h-[calc(100svh-6.5rem)]">
      <section
        className="flex min-h-0 flex-col justify-between bg-ink text-canvas"
        style={{ padding: "clamp(18px, 3.4vw, 48px)" }}
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
        <div className="mt-8 max-w-xl lg:mt-10">
          <p className="eyebrow-inverse">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,3.75rem)] font-light leading-[1.07] tracking-[-.025em] text-canvas text-balance">
            {title}
          </h1>
          <p className="mt-4 hidden max-w-md text-sm leading-6 text-canvas/80 lg:block">
            Procurement and sourcing are independently governed journeys.
          </p>
        </div>
      </section>
      <section
        className="flex min-h-0 flex-col overflow-y-auto overscroll-contain px-5 py-5 sm:px-10 lg:px-[clamp(28px,5vw,64px)] lg:py-6"
        aria-label="Portal credentials"
      >
        <div className="my-auto mx-auto w-full max-w-lg border-t-[3px] border-clay pt-4 lg:pt-5">
          <p className="mb-4 text-sm leading-6 text-muted">{description}</p>
          {children}
        </div>
      </section>
    </div>
  )
}
