import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SupplierEditorialHero } from "@/components/marketing/supplier-editorial-hero"
import { ButtonLink } from "@/components/ui/button"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "Become a supplier",
  description:
    "Apply to join the ZuriBeans sourcing network with structured business, product, origin and capacity information.",
  path: "/sourcing/become-a-supplier",
})

const stages = [
  {
    number: "01",
    title: "Review",
    description:
      "Confirm your business, products and supply capability are ready for qualification.",
  },
  {
    number: "02",
    title: "Apply",
    description: "Provide structured company, product, capacity and evidence information.",
  },
  {
    number: "03",
    title: "Qualification",
    description: "The sourcing team reviews fit, documentation and any follow-up requirements.",
  },
] as const

export default function BecomeASupplierPage() {
  return (
    <>
      <SupplierEditorialHero
        eyebrow="Become a supplier"
        title="Bring a clear supply picture."
        description="Review the information and evidence ZuriBeans needs before beginning the structured supplier application."
      />

      <section
        aria-label="Supplier application pathway"
        className="bg-canvas"
        style={{ paddingBlock: "clamp(48px, 7vw, 88px)" }}
      >
        <div className="page-container">
          <ol className="grid gap-px border border-line bg-line md:grid-cols-3">
            {stages.map((stage) => (
              <li key={stage.number} className="bg-canvas px-6 py-8 sm:px-7"
                style={{ minHeight: 230 }}>
                <span className="text-xs font-bold tracking-wider text-clay-on-light">
                  {stage.number}
                </span>
                <h2 className="mt-9 font-display font-normal leading-tight text-ink"
                  style={{ fontSize: 27 }}>
                  {stage.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted">{stage.description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-9 flex flex-col items-start justify-between gap-6 bg-surface-muted p-6 sm:flex-row sm:items-center sm:p-7">
            <div>
              <h2 className="font-semibold text-ink">
                Ready to provide a complete supply profile?
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Create your secure supplier login to begin or continue your application. Submission
                starts review; it does not grant supplier approval.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
              <ButtonLink
                href="/supplier/register"
                size="lg"
                className="w-full whitespace-nowrap sm:w-auto"
                style={{ color: "var(--color-canvas)" }}
              >
                Begin supplier application
                <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
              <Link
                href="/supplier/login"
                className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-ink underline underline-offset-4"
              >
                Existing supplier? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
