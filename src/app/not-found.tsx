import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="page-container py-16">
      <div className="rounded-panel border border-line bg-surface-raised p-8 md:p-10">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl text-balance">
          This address is not part of the ZuriBeans estate.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          The page may have moved, or the address may be incorrect. Return to the public estate or
          continue with the current product catalogue.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/">Return home</ButtonLink>
          <ButtonLink href="/products" variant="outline">
            Browse products
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
