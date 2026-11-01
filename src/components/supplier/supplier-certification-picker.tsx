"use client"

import { useState } from "react"
import { Input } from "@/components/ui/form-controls"

export const CERTIFICATION_CHOICES = [
  "UTZ / Rainforest Alliance",
  "Organic (EU)",
  "Organic (NOP)",
  "Fair Trade",
  "GlobalG.A.P",
  "ISO 22000",
  "FSSC 22000",
] as const

export type CertificationPrefill = {
  certificationType?: string
  issuer?: string | null
  referenceNumber?: string | null
  issuedOn?: string | null
  expiresOn?: string | null
}

type Certification = {
  type: string
  issuer: string
  reference: string
  issuedOn: string
  expiresOn: string
}

const maxCertificates = 3

/**
 * Reproduces the Make prototype's selectable certification cards while
 * preserving the existing server contract: three indexed certification
 * records with type, issuer, reference and date fields.
 *
 * Selection is a DECLARATION, not certification verification.
 */
export function SupplierCertificationPicker({
  initial = [],
}: {
  initial?: readonly CertificationPrefill[]
}) {
  const [rows, setRows] = useState<Certification[]>(() =>
    Array.from({ length: maxCertificates }, (_, index) => ({
      type: initial[index]?.certificationType ?? "",
      issuer: initial[index]?.issuer ?? "",
      reference: initial[index]?.referenceNumber ?? "",
      issuedOn: initial[index]?.issuedOn ?? "",
      expiresOn: initial[index]?.expiresOn ?? "",
    })),
  )

  const selected = rows.map((row) => row.type).filter(Boolean)
  const toggle = (choice: string) => {
    setRows((current) => {
      const matching = current.findIndex((row) => row.type === choice)
      if (matching !== -1)
        return current.map((row, index) => index === matching ? { ...row, type: "" } : row)
      const empty = current.findIndex((row) => !row.type)
      if (empty === -1) return current
      return current.map((row, index) => index === empty ? { ...row, type: choice } : row)
    })
  }

  const change = (index: number, key: keyof Certification, value: string) =>
    setRows((current) => current.map((row, i) => i === index ? { ...row, [key]: value } : row))

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        {CERTIFICATION_CHOICES.map((choice) => {
          const checked = selected.includes(choice)
          const disabled = !checked && selected.length >= maxCertificates
          return (
            <label
              key={choice}
              className="flex min-h-12 items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm"
              style={checked ? { borderColor: "var(--color-leaf)", backgroundColor: "rgb(46 90 76 / 0.06)" } : undefined}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(choice)}
                className="size-5 accent-leaf"
                aria-label={choice}
              />
              <span className={checked ? "font-semibold text-ink" : "text-ink"}>{choice}</span>
            </label>
          )
        })}
        <label className="flex min-h-12 items-center gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={selected.length === 0}
            onChange={(event) => {
              if (event.target.checked) setRows((current) => current.map((row) => ({ ...row, type: "" })))
            }}
            className="size-5 accent-leaf"
            aria-label="None — applying for first time"
          />
          <span>None — applying for first time</span>
        </label>
      </div>
      <p className="text-xs leading-5 text-muted" role="status">
        Select up to three declarations, or choose none. Further certifications can be submitted
        when the owning provider supports additional records.
      </p>
      {rows.map((row, index) => (
        <fieldset key={index} className="rounded-control border border-line bg-surface p-5">
          <legend className="px-2 text-sm font-semibold">Certification {index + 1}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              Certification type
              <Input
                name="certification_type"
                value={row.type}
                onChange={(event) => change(index, "type", event.target.value)}
                list="supplier-certifications"
                placeholder="Select above or enter a certificate"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Issuer
              <Input name="certification_issuer" value={row.issuer} onChange={(event) => change(index, "issuer", event.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Reference number
              <Input name="certification_reference" value={row.reference} onChange={(event) => change(index, "reference", event.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Issued on
              <Input type="date" name="certification_issued_on" value={row.issuedOn} onChange={(event) => change(index, "issuedOn", event.target.value)} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Expires on
              <Input type="date" name="certification_expires_on" value={row.expiresOn} onChange={(event) => change(index, "expiresOn", event.target.value)} />
            </label>
          </div>
        </fieldset>
      ))}
      <datalist id="supplier-certifications">
        {CERTIFICATION_CHOICES.map((choice) => <option key={choice} value={choice} />)}
      </datalist>
    </div>
  )
}
