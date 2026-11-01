"use client"

import { useRef, useState, type ReactNode } from "react"
import Link from "next/link"

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
  action: (formData: FormData) => Promise<void>
  mode?: "apply" | "resubmit"
  error?: string | null
}

export function SupplierApplicationJourney({ sections, action, mode = "apply", error }: Props) {
  const [step, setStep] = useState(0)
  const [snapshot, setSnapshot] = useState<[string, string][]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const last = SUPPLIER_STEPS.length - 1

  function advance() {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-supplier-section="${step}"]`)
    for (const control of section?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ) ?? []) {
      if (!control.reportValidity()) {
        control.focus()
        return
      }
    }
    if (step === last - 1 && formRef.current) {
      const data = new FormData(formRef.current)
      const get = (key: string) => data.get(key)?.toString() || "—"
      setSnapshot([
        ["Organisation", get("legalName")],
        ["Country", get("countryCode")],
        ["Registration", get("registrationNumber")],
        ["Primary contact", get("contactName")],
        ["Email", get("contactEmail")],
        ["Products", data.getAll("capability_category").map(String).filter(Boolean).join(", ") || "—"],
        ["Annual capacity", data.getAll("capability_capacity").map(String).filter(Boolean).join(", ") || "—"],
        ["Origin", data.getAll("capability_origin_country").map(String).filter(Boolean).join(", ") || "—"],
        ["Season", data.getAll("capability_season").map(String).filter(Boolean).join(", ") || "—"],
        ["Certifications", data.getAll("certification_type").map(String).filter(Boolean).join(", ") || "None declared"],
      ])
    }
    setStep((current) => Math.min(last, current + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-w-0 bg-canvas">
      <header className="bg-ink px-5 py-10 text-canvas">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-xs font-semibold text-clay-inverse">← ZuriBeans.com</Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-clay-inverse">Supplier Programme</p>
          <h1 className="mt-3 font-display text-4xl font-light sm:text-5xl">
            {mode === "apply" ? "Supplier Application" : "Supplier Resubmission"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-canvas/75">
            Join the ZuriBeans supplier network. Complete all sections for sourcing review.
            Submission does not constitute approval.
          </p>
        </div>
      </header>
      <div className="sticky top-0 z-30 border-b border-line bg-surface-muted">
        <div className="mx-auto max-w-3xl px-5">
          <nav className="hidden min-h-14 items-center md:flex" aria-label="Supplier application progress">
            {SUPPLIER_STEPS.map((label, index) => (
              <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => setStep(index)}
                  aria-current={index === step ? "step" : undefined}
                  className="flex min-w-0 items-center gap-1 text-xs disabled:cursor-default"
                >
                  <span className={index <= step
                    ? "grid size-6 shrink-0 place-items-center rounded-full bg-ink text-white"
                    : "grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-muted"
                  }>{index < step ? "✓" : index + 1}</span>
                  <span className={index === step ? "font-bold" : "text-muted"}>{label}</span>
                </button>
                {index < last ? <span className="h-px min-w-2 flex-1 bg-line-strong" /> : null}
              </div>
            ))}
          </nav>
          <div className="flex min-h-12 items-center justify-between gap-3 md:hidden">
            <strong className="text-sm">Step {step + 1} of {SUPPLIER_STEPS.length}: {SUPPLIER_STEPS[step]}</strong>
            <span aria-hidden="true" className="flex gap-1">
              {SUPPLIER_STEPS.map((label, index) => (
                <span key={label} className={index === step ? "h-1.5 w-4 rounded bg-ink" : "size-1.5 rounded bg-line-strong"} />
              ))}
            </span>
          </div>
        </div>
      </div>
      <form action={action} ref={formRef} className="mx-auto max-w-3xl px-5 pb-32 pt-10" aria-label="Supplier application">
        {error ? <p role="alert" className="mb-6 rounded-control border border-danger bg-danger-soft p-4 text-danger-strong">{error}</p> : null}
        {sections.map((section, index) => (
          <div key={index} data-supplier-section={index} hidden={step !== index}>
            {section}
          </div>
        ))}
        <section hidden={step !== last} aria-label="Review and submit">
          <h2 className="font-display text-2xl">Review & Submit</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Review your application before sending it to the sourcing team.</p>
          <dl className="mt-8 divide-y divide-line">
            {snapshot.map(([label, value]) => (
              <div key={label} className="grid gap-3 py-4 text-sm sm:grid-cols-[10rem_1fr]">
                <dt className="text-muted">{label}</dt><dd className="min-w-0 break-words font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 rounded-control border border-leaf bg-success-soft p-4 text-sm leading-7">
            By submitting, you confirm that the supplied information is accurate and authorise
            standard supplier due diligence. Declarations remain unverified until independently assessed.
          </p>
        </section>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas px-5 py-3">
          <div className="mx-auto flex max-w-3xl gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)}
                className="min-h-12 rounded-control border border-line-strong px-5 text-sm font-semibold">
                ← Back
              </button>
            ) : null}
            {step < last ? (
              <button type="button" onClick={advance}
                className="min-h-12 flex-1 rounded-control bg-ink px-6 text-sm font-bold text-white">
                Continue: {SUPPLIER_STEPS[step + 1]} →
              </button>
            ) : (
              <button type="submit" className="min-h-12 flex-1 rounded-control bg-leaf px-6 text-sm font-bold text-white">
                {mode === "apply" ? "Submit Application" : "Resubmit for Review"} →
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
