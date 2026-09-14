"use client"

import { Button } from "@/components/ui/button"
import "./globals.css"

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <title>Service interruption | ZuriBeans</title>
        <main className="page-container flex min-h-screen items-center py-16">
          <section
            className="w-full rounded-panel border border-line bg-surface-raised p-8 md:p-10"
            role="alert"
          >
            <p className="eyebrow">Service interruption</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl text-balance">
              ZuriBeans is temporarily unable to respond.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Retry the request. No order, quotation or supplier status should be assumed to have
              changed until the relevant journey confirms it.
            </p>
            <Button className="mt-6" onClick={retry}>
              Try again
            </Button>
          </section>
        </main>
      </body>
    </html>
  )
}
