"use client"

import { Button, ButtonLink } from "@/components/ui/button"

export default function ErrorPage({
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset: () => void
}) {
  const recover = retry ?? reset

  return (
    <section className="page-container py-16" role="alert">
      <div className="rounded-panel border border-line bg-surface-raised p-8 md:p-10">
        <p className="eyebrow">Service interruption</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl text-balance">
          We could not complete this request.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Try the request again. If the interruption continues, return to the public estate and
          contact ZuriBeans with the time it occurred.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={recover}>Try again</Button>
          <ButtonLink href="/contact" variant="outline">
            Contact ZuriBeans
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
