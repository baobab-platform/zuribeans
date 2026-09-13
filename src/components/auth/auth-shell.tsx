import type { ReactNode } from "react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

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
    <section className="page-container py-12 lg:py-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-balance">{title}</h1>
          <p className="mt-5 text-base leading-7 text-muted">{description}</p>
        </div>
        <div className="rounded-panel border border-line bg-surface-raised p-6 shadow-panel sm:p-8">
          {children}
        </div>
      </div>
    </section>
  )
}
