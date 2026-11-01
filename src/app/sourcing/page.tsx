import { SupplierEditorialHero } from "@/components/marketing/supplier-editorial-hero"
import { ButtonLink } from "@/components/ui/button"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "Sourcing",
  description: "How ZuriBeans engages and qualifies agricultural suppliers.",
  path: "/sourcing",
})

const requirements = [
  "Registered business identity",
  "Clear product and origin profile",
  "Capacity and seasonality detail",
  "Quality and certification evidence",
] as const

export default function SourcingPage() {
  return (
    <>
      <SupplierEditorialHero
        eyebrow="Supplier sourcing"
        title="Qualification starts with a clear supply picture."
        description="ZuriBeans works with growers, cooperatives, processors and exporters through a structured, evidence-led qualification process."
      />

      <section aria-labelledby="sourcing-qualification-title" className="bg-canvas py-[clamp(48px,7vw,88px)]">
        <div className="page-container grid gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="eyebrow mb-5">Before you apply</p>
            <h2
              id="sourcing-qualification-title"
              className="font-display text-[clamp(30px,4vw,46px)] font-light leading-[1.12] tracking-[-.02em] text-ink"
            >
              A serious route to a serious supply relationship.
            </h2>
            <p className="mt-6 text-base leading-7 text-muted">
              Qualification is not an instant marketplace listing. It creates a reviewable record
              of the business, supply capability and evidence behind the product.
            </p>
            <ButtonLink
              href="/sourcing/become-a-supplier"
              size="lg"
              className="mt-8"
              style={{ color: "var(--color-canvas)" }}
            >
              Review the application path
            </ButtonLink>
          </div>
          <ol className="border-t border-line-strong">
            {requirements.map((requirement, index) => (
              <li
                key={requirement}
                className="flex min-h-[76px] items-center gap-5 border-b border-line py-4"
              >
                <span className="shrink-0 text-xs font-bold tracking-wider text-clay-on-light">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-semibold text-ink">{requirement}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
