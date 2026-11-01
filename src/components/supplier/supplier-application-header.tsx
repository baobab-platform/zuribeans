type Props = { mode?: "apply" | "resubmit"; preview?: boolean }

/** Server-rendered static introduction; never ship editorial markup as client JavaScript. */
export function SupplierApplicationHeader({ mode = "apply", preview = false }: Props) {
  return (
      <header
        className="bg-ink px-5 text-canvas"
        style={{ paddingBlock: "clamp(32px, 5vw, 56px) clamp(24px, 4vw, 40px)" }}
      >
        <div className="mx-auto max-w-3xl">
          <a href="/" className="text-xs font-semibold text-clay-inverse">
            ← ZuriBeans.com
          </a>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-clay-inverse">
            Supplier Programme
          </p>
          <h1 className="mt-3 font-display text-4xl font-light sm:text-5xl">
            {mode === "apply" ? "Supplier Application" : "Supplier Resubmission"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-canvas/75">
            Join the ZuriBeans verified supplier network. Complete all sections — your application
            will be reviewed by our sourcing team. Submission does not constitute approval.
          </p>
          {preview ? (
            <p className="mt-3 text-sm font-semibold text-clay-inverse">
              Synthetic development preview — no supplier account or submission is created.
            </p>
          ) : null}
        </div>
      </header>
  )
}
