"use client"

import { useState } from "react"
import type { ProductDetailModel } from "@/lib/medusa/types"

const tabs = [
  { id: "specifications", label: "Specifications" },
  { id: "provenance", label: "Provenance" },
  { id: "quality", label: "Quality" },
  { id: "evidence", label: "Evidence & Docs" },
] as const
type TabId = (typeof tabs)[number]["id"]
type Field = { label: string; value: string }

function FieldGrid({ fields }: { fields: readonly Field[] }) {
  return fields.length ? (
    <dl className="mt-6 grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.label}
          className="min-w-0 rounded-panel border border-line bg-surface-muted p-4"
        >
          <dt className="text-xs font-medium text-muted">{field.label}</dt>
          <dd className="mt-2 break-words text-sm font-semibold text-ink">{field.value}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <p className="mt-5 text-sm text-muted">No published information for this section.</p>
  )
}

/**
 * Full Figma PDP dossier. All displayed fields are data-driven; the development
 * producer supplies realistic synthetic documents, certificates and trade terms.
 * No document link or commercial commit endpoint is generated from dossier data.
 */
export function ProductDossierTabs({ product }: { product: ProductDetailModel }) {
  const [activeTab, setActiveTab] = useState<TabId>("specifications")
  const dossier = product.dossier
  const provenance =
    dossier?.provenance ??
    product.specifications.filter((spec) =>
      /origin|lot|harvest|region|altitude|traceab|farm|producer/i.test(spec.label),
    )
  const quality =
    dossier?.quality ??
    product.specifications.filter((spec) =>
      /grade|screen|moisture|defect|cup|quality|process|inspection/i.test(spec.label),
    )

  return (
    <section aria-label="Product dossier" className="min-w-0" id="product-dossier">
      <div className="max-w-full overflow-x-auto border-b border-line" tabIndex={0}>
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Product dossier sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`product-panel-${tab.id}`}
              id={`product-tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
                event.preventDefault()
                const index = tabs.findIndex((entry) => entry.id === activeTab)
                const nextIndex =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
                const target = tabs[nextIndex]
                setActiveTab(target.id)
                document.getElementById(`product-tab-${target.id}`)?.focus()
              }}
              className="min-h-12 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-ink aria-selected:border-ink aria-selected:text-ink"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`product-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`product-tab-${tab.id}`}
          tabIndex={0}
          hidden={activeTab !== tab.id}
          className="py-7 focus-visible:outline-2 focus-visible:outline-ink"
        >
          {tab.id === "specifications" ? (
            <>
              <h2 className="font-display text-2xl">Product specifications</h2>
              <FieldGrid fields={product.specifications} />
              {product.variants.length ? (
                <div className="mt-9">
                  <h3 className="font-display text-xl">Published formats</h3>
                  <dl className="mt-4 divide-y divide-line border-y border-line">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="grid gap-1 py-3 text-sm sm:grid-cols-[10rem_1fr]"
                      >
                        <dt className="text-muted">{variant.title}</dt>
                        <dd className="break-all font-medium">{variant.sku || "SKU on request"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </>
          ) : null}
          {tab.id === "provenance" ? (
            <>
              <h2 className="font-display text-2xl">Origin & provenance</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {product.origin
                  ? `Origin: ${product.origin}. Traceability details are displayed below where supplied.`
                  : "Origin has not been published for this product."}
              </p>
              <FieldGrid fields={provenance} />
            </>
          ) : null}
          {tab.id === "quality" ? (
            <>
              <h2 className="font-display text-2xl">Quality & grading</h2>
              {product.qualityInformation ? (
                <p className="mt-4 text-sm leading-7 text-muted">{product.qualityInformation}</p>
              ) : null}
              <FieldGrid fields={quality} />
            </>
          ) : null}
          {tab.id === "evidence" ? (
            <>
              <h2 className="font-display text-2xl">Evidence & documents</h2>
              {dossier?.certifications.length ? (
                <section aria-labelledby="dossier-certificates" className="mt-6">
                  <h3 id="dossier-certificates" className="font-display text-xl">
                    Certifications & compliance
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {dossier.certifications.map((cert) => (
                      <article
                        key={cert.certificateId}
                        className="rounded-panel border border-line bg-surface p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="font-semibold">{cert.name}</h4>
                          <span className="rounded-full bg-surface-muted px-2 py-1 text-xs font-semibold capitalize">
                            {cert.status}
                          </span>
                        </div>
                        <dl className="mt-4 space-y-2 text-sm">
                          <div>
                            <dt className="text-xs text-muted">Scheme</dt>
                            <dd>{cert.scheme}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">Issuer</dt>
                            <dd>{cert.issuer}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">Reference</dt>
                            <dd className="break-all font-mono text-xs">{cert.certificateId}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">Valid until</dt>
                            <dd>{cert.validUntil || "Under review"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">Scope</dt>
                            <dd>{cert.scope}</dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>
              ) : product.certifications.length ? (
                <ul className="mt-6 space-y-2">
                  {product.certifications.map((name) => (
                    <li key={name} className="rounded-panel border border-line p-4 text-sm">
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-muted">No certification records are published.</p>
              )}
              {dossier?.documents.length ? (
                <section aria-labelledby="dossier-documents" className="mt-9">
                  <h3 id="dossier-documents" className="font-display text-xl">
                    Document register
                  </h3>
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {dossier.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">{doc.title}</p>
                          <p className="mt-1 break-all text-xs text-muted">
                            {doc.reference} · {doc.issuer}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {doc.kind} · {doc.issuedAt || "Issue date pending"}
                          </p>
                        </div>
                        <span className="w-fit rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold capitalize">
                          {doc.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <p className="mt-5 text-sm text-muted">
                  Documents may be requested from the trade desk.
                </p>
              )}
              <p className="mt-5 text-xs leading-5 text-muted">
                Document details are informational; no download or verification action is provided
                without the owning document service.
              </p>
            </>
          ) : null}
        </div>
      ))}
    </section>
  )
}
