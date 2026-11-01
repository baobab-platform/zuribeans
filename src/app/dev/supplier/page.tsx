import Link from "next/link"
import { notFound } from "next/navigation"
import { SupplierApplicationJourney } from "@/components/supplier/supplier-application-journey"
import { supplierApplicationSections } from "@/components/supplier/supplier-application-sections"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import { DEMO_SUPPLIER_JOURNEYS } from "@/lib/dev-data/supplier-journeys"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Synthetic Supplier Journey | ZuriBeans",
  robots: { index: false, follow: false },
}

export default async function SyntheticSupplierJourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ supplier?: string }>
}) {
  if (!isSyntheticExperienceEnabled()) notFound()
  const { supplier } = await searchParams
  const example = DEMO_SUPPLIER_JOURNEYS.find((s) => s.id === supplier) ?? DEMO_SUPPLIER_JOURNEYS[0]
  if (!example) notFound()

  return (
    <section className="bg-canvas pb-16">
      <div className="page-container py-7">
        <Link href="/dev/experience" className="text-sm font-semibold underline">
          ← Back to experience laboratory
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase text-muted">
          ZB-DEV-DATA · not indexed · not a real supplier
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DEMO_SUPPLIER_JOURNEYS.map((record) => (
            <Link
              key={record.id}
              href={`/dev/supplier?supplier=${encodeURIComponent(record.id)}`}
              aria-current={record.id === example.id ? "page" : undefined}
              className={
                record.id === example.id
                  ? "rounded-full border border-ink bg-ink px-3 py-2 text-xs text-white"
                  : "rounded-full border border-line px-3 py-2 text-xs text-ink"
              }
            >
              {record.country} · {record.id.split("-").at(-1)}
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded-panel border border-line bg-surface p-5">
          <h2 className="font-display text-2xl">{example.label}</h2>
          <p className="mt-2 text-sm text-muted">
            Example application state: {example.stage.replaceAll("_", " ")} · Review date:{" "}
            {example.lastStatusDate}
          </p>
          <p className="mt-2 text-sm">{example.lastReviewNote}</p>
          <p className="mt-2 text-xs text-muted">
            Certificates and evidence below are fictional. There is no IAM Principal, canonical
            supplier Organisation or approved mandate behind this preview.
          </p>
        </div>
      </div>
      <SupplierApplicationJourney preview sections={supplierApplicationSections(example.form)} />
    </section>
  )
}
