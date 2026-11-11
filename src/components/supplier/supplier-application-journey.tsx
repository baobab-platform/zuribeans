"use client"

import { useRef, useState, type ReactNode } from "react"

export const SUPPLIER_STEPS = [
  "Business",
  "Contacts",
  "Products & Capacity",
  "Origin & Season",
  "Certifications",
  "Review & Submit",
] as const

type Props = {
  sections: ReactNode[]
  heading?: ReactNode
  action?: (formData: FormData) => Promise<void>
  mode?: "apply" | "resubmit"
  error?: string | null
  preview?: boolean
}

export function SupplierApplicationJourney({
  sections,
  heading,
  action,
  mode = "apply",
  error,
  preview = false,
}: Props) {
  const [step, setStep] = useState(0)
  const [snapshot, setSnapshot] = useState<[string, string][]>([])
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [previewMessage, setPreviewMessage] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const last = SUPPLIER_STEPS.length - 1

  function advance() {
    setValidationMessage(null)
    const section = formRef.current?.querySelector<HTMLElement>(`[data-supplier-section="${step}"]`)
    for (const control of section?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea") ?? []) {
      if (!control.reportValidity()) {
        control.focus()
        return
      }
    }
    if (formRef.current && step === 0 && !new FormData(formRef.current).get("countryCode")) {
      setValidationMessage("Select the country where your organisation is registered.")
      section?.querySelector<HTMLElement>('[role="combobox"]')?.focus()
      return
    }
    if (
      formRef.current &&
      step === 2 &&
      !new FormData(formRef.current)
        .getAll("capability_category")
        .some((value) => String(value).trim())
    ) {
      setValidationMessage("Select at least one product category before continuing.")
      section?.querySelector<HTMLElement>('[role="combobox"]')?.focus()
      return
    }
    if (step === last - 1 && formRef.current) {
      const data = new FormData(formRef.current)
      const fields = [
        ["Organisation", "legalName"],
        ["Country", "countryCode"],
        ["Registration", "registrationNumber"],
        ["Primary contact", "contactName"],
        ["Email", "contactEmail"],
      ] as const
      const collections = [
        ["Products", "capability_category"],
        ["Annual capacity", "capability_capacity"],
        ["Origin", "capability_origin_country"],
        ["Season", "capability_season"],
        ["Certifications", "certification_type"],
      ] as const
      setSnapshot([
        ...fields.map(
          ([label, key]) => [label, data.get(key)?.toString() || "—"] as [string, string],
        ),
        ...collections.map(
          ([label, key]) =>
            [
              label,
              data.getAll(key).filter(Boolean).join(", ") ||
                (key === "certification_type" ? "None declared" : "—"),
            ] as [string, string],
        ),
      ])
    }
    setStep((current) => Math.min(last, current + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div data-supplier-journey className="min-w-0 bg-canvas">
      {heading}
      <div className="sticky top-0 border-b border-line bg-surface-muted" style={{ zIndex: 30 }}>
        <div className="mx-auto max-w-3xl px-5">
          <nav
            className="hidden items-center md:flex"
            style={{ minHeight: "3.5rem" }}
            aria-label="Supplier application progress"
          >
            {SUPPLIER_STEPS.map((label, index) => (
              <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => setStep(index)}
                  aria-current={index === step ? "step" : undefined}
                  className="flex min-w-0 items-center gap-1 text-xs disabled:cursor-default"
                >
                  <span
                    className={
                      index <= step
                        ? "grid size-6 shrink-0 place-items-center rounded-full bg-ink text-white"
                        : "grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-muted"
                    }
                  >
                    {index < step ? "✓" : index + 1}
                  </span>
                  <span className={index === step ? "font-bold" : "text-muted"}>{label}</span>
                </button>
                {index < last ? (
                  <span className="h-px flex-1 bg-line-strong" style={{ minWidth: "0.5rem" }} />
                ) : null}
              </div>
            ))}
          </nav>
          <div className="flex min-h-12 items-center justify-between gap-3 md:hidden">
            <strong className="text-sm">
              Step {step + 1} of {SUPPLIER_STEPS.length}: {SUPPLIER_STEPS[step]}
            </strong>
            <span aria-hidden="true" className="flex gap-1">
              {SUPPLIER_STEPS.map((label, index) => (
                <span
                  key={label}
                  className={
                    index === step ? "h-1.5 w-4 rounded bg-ink" : "size-1.5 rounded bg-line-strong"
                  }
                />
              ))}
            </span>
          </div>
        </div>
      </div>
      <form
        action={action}
        ref={formRef}
        className="mx-auto max-w-3xl px-5 pt-10"
        style={{ paddingBottom: "8rem" }}
        aria-label="Supplier application"
        onSubmit={
          preview
            ? (event) => {
                event.preventDefault()
                setPreviewMessage(true)
              }
            : undefined
        }
      >
        {preview ? (
          <p className="mb-6 rounded-control border border-line bg-sand p-4 text-sm font-semibold">
            Development preview · the form is interactive but cannot submit a supplier application.
          </p>
        ) : null}
        {previewMessage ? (
          <p
            role="status"
            className="mb-6 rounded-control border border-leaf bg-success-soft p-4 text-sm"
          >
            Preview complete. No application, supplier principal, approval or documentary record was
            created.
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mb-6 rounded-control border border-danger bg-danger-soft p-4 text-danger-strong"
          >
            {error}
          </p>
        ) : null}
        {validationMessage ? (
          <p
            role="alert"
            className="mb-6 rounded-control border border-danger bg-danger-soft p-4 text-danger-strong"
          >
            {validationMessage}
          </p>
        ) : null}
        {sections.map((section, index) => (
          <div key={index} data-supplier-section={index} hidden={step !== index}>
            {section}
          </div>
        ))}
        <section hidden={step !== last} aria-label="Review and submit">
          <h2 className="font-display text-2xl">Review & Submit</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Review your application before sending it to the sourcing team.
          </p>
          <dl className="mt-8 divide-y divide-line">
            {snapshot.map(([label, value]) => (
              <div key={label} className="grid gap-3 py-4 text-sm sm:grid-cols-[10rem_1fr]">
                <dt className="text-muted">{label}</dt>
                <dd className="min-w-0 break-words font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {mode === "resubmit" ? (
            <label className="mt-6 block text-sm font-semibold">
              Note to sourcing team
              <textarea
                name="resubmitNote"
                rows={3}
                placeholder="Explain your updated information or evidence."
                className="mt-2 w-full rounded-control border border-line-strong bg-surface p-4 text-ink"
              />
            </label>
          ) : null}
          <p className="mt-8 rounded-control border border-leaf bg-success-soft p-4 text-sm leading-7">
            By submitting, you confirm that the supplied information is accurate and authorise
            standard supplier due diligence. Declarations remain unverified until independently
            assessed.
          </p>
        </section>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas px-5 py-3">
          <div className="mx-auto flex max-w-3xl gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-12 rounded-control border border-line-strong px-5 text-sm font-semibold"
              >
                ← Back
              </button>
            ) : null}
            {step < last ? (
              <button
                type="button"
                onClick={advance}
                className="min-h-12 flex-1 rounded-control bg-ink px-6 text-sm font-bold text-white"
              >
                Continue: {SUPPLIER_STEPS[step + 1]} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={preview}
                className="min-h-12 flex-1 rounded-control bg-leaf px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {preview
                  ? "Preview only — no submission"
                  : mode === "apply"
                    ? "Submit Application"
                    : "Resubmit for Review"}{" "}
                →
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
