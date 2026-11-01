import Link from "next/link"
import { notFound } from "next/navigation"
import { SupplierPortalEntry } from "@/components/supplier/supplier-portal-entry"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import { DEMO_SUPPLIER_JOURNEYS } from "@/lib/dev-data/supplier-journeys"
import { getSupplierStatusPresentation } from "@/lib/supplier/presentation"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Synthetic Supplier Portal | ZuriBeans",
  robots: { index: false, follow: false },
}

/**
 * Presentation-only supplier workspace, modelled on Make's /supplier portal
 * entry and ZuriBeans' governed supplier status display. No auth, submission,
 * status transition, upload or native engine call is performed from this route.
 */
export default async function SyntheticSupplierPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ supplier?: string }>
}) {
  if (!isSyntheticExperienceEnabled()) notFound()
  const { supplier } = await searchParams
  const selected = DEMO_SUPPLIER_JOURNEYS.find((record) => record.id === supplier)
  const example = selected ?? DEMO_SUPPLIER_JOURNEYS[0]
  if (!example) notFound()

  const status = getSupplierStatusPresentation(example.stage)
  const applicationHref = `/dev/supplier?supplier=${encodeURIComponent(example.id)}`

  return (
    <main className="min-w-0 bg-canvas">
      <div className="page-container py-5">
        <Link href="/dev/experience" className="text-sm font-semibold underline">
          ← Development experience laboratory
        </Link>
      </div>
      <SupplierPortalEntry
        preview
        eyebrow="Supplier portal"
        title="Manage your supplier relationship."
        description="The supplier workspace is separate from buyer accounts and supports applications, evidence requests and qualification updates."
        primaryHref={applicationHref}
        primaryLabel="Open supplier application"
        secondaryHref="/sourcing/become-a-supplier"
        secondaryLabel="Review supplier requirements"
      />
      <section className="page-container space-y-8 py-12" aria-label="Synthetic supplier workspace">
        <div>
          <p className="eyebrow">Supplier experience laboratory</p>
          <h2 className="mt-3 font-display text-3xl">Example supplier workspace</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Choose a fictional supplier to inspect country, product, qualification and documentary
            states. This route has no supplier identity, authorisation or commercial authority.
          </p>
        </div>
        <nav aria-label="Select example supplier" className="flex flex-wrap gap-2">
          {DEMO_SUPPLIER_JOURNEYS.map((record) => (
            <Link
              key={record.id}
              href={`/dev/supplier/portal?supplier=${encodeURIComponent(record.id)}`}
              aria-current={record.id === example.id ? "page" : undefined}
              className={
                record.id === example.id
                  ? "rounded-full border border-ink bg-ink px-3 py-2 text-xs font-semibold text-white"
                  : "rounded-full border border-line px-3 py-2 text-xs font-semibold"
              }
            >
              {record.country} · {record.id.split("-").at(-1)}
            </Link>
          ))}
        </nav>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Application status</p>
                <h3 className="mt-3 font-display text-3xl">{status.label}</h3>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">{status.description}</p>
            <p className="mt-3 text-sm">{example.lastReviewNote}</p>
            <p className="mt-3 text-xs text-muted">Illustrative review: {example.lastStatusDate}</p>
            {example.stage === "more_information_required" ||
            example.stage === "sample_required" ? (
              <Link href={applicationHref} className="mt-5 inline-block font-semibold underline">
                Inspect application and required updates →
              </Link>
            ) : null}
          </Card>
          <Card>
            <p className="eyebrow">Organisation profile</p>
            <h3 className="mt-3 font-display text-2xl">{example.form.legalName}</h3>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Country", example.country],
                ["Registration", example.form.registrationNumber || "Not supplied"],
                ["Tax reference", example.form.taxIdentifier || "Not supplied"],
                ["Contact", example.form.contactName || "Not supplied"],
                ["Contact email", example.form.contactEmail || "Not supplied"],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line pb-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="mt-1 break-words font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <p className="eyebrow">Declared supply capabilities</p>
            <h3 className="mt-3 font-display text-2xl">Products & capacity</h3>
            <ul className="mt-5 space-y-4">
              {example.form.capabilities?.map((capability, index) => (
                <li key={index} className="rounded-control border border-line p-4">
                  <p className="font-semibold capitalize">{capability.category || "Other"}</p>
                  <p className="mt-2 text-sm text-muted">
                    {[capability.variety, capability.grade, capability.originCountryCode]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-2 text-sm">
                    {capability.capacityDescription || "Capacity not specified"}
                  </p>
                  <Badge tone="warning" className="mt-3">
                    Declared · not verified
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="eyebrow">Certification declarations</p>
            <h3 className="mt-3 font-display text-2xl">Qualifications</h3>
            <ul className="mt-5 space-y-3">
              {example.form.certifications?.map((cert, index) => (
                <li key={index} className="border-b border-line pb-4">
                  <p className="font-semibold">{cert.certificationType}</p>
                  <p className="mt-1 text-sm text-muted">{cert.issuer}</p>
                  <p className="mt-1 break-all text-xs text-muted">{cert.referenceNumber}</p>
                  <Badge tone="warning" className="mt-2">
                    Declaration only
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <p className="eyebrow">Documentary evidence</p>
            <h3 className="mt-3 font-display text-2xl">Document register</h3>
            <ul className="mt-5 divide-y divide-line">
              {example.documents.map((doc) => (
                <li
                  key={doc.reference}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{doc.type}</p>
                    <p className="mt-1 break-all text-xs text-muted">{doc.reference}</p>
                  </div>
                  <Badge tone={doc.status === "requested" ? "warning" : "info"}>{doc.status}</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-6 text-muted">
              Document references are synthetic. No file, verified evidence or documentary custody
              is available from the preview.
            </p>
          </Card>
        </div>
        <Link
          href={applicationHref}
          className="inline-flex min-h-12 items-center rounded-control bg-ink px-6 py-3 text-sm font-bold text-white"
        >
          Review the six-step application →
        </Link>
      </section>
    </main>
  )
}
