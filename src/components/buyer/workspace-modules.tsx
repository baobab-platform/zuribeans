import { Card } from "@/components/ui/card"

/**
 * Faithful Figma Make information architecture without inventing commercial data.
 * Real RFQ, quotation, shipment, and finance adapters must qualify independently
 * before these modules can become transaction links or show fabricated counters.
 */
const pendingModules = [
  {
    label: "Requests for quotation",
    description:
      "Submit and track procurement requirements once the governed Trade RFQ integration is qualified.",
  },
  {
    label: "Quotations",
    description:
      "Review versioned and authorised commercial proposals, never browser-created prices.",
  },
  {
    label: "Orders",
    description:
      "Track buyer-approved commitments only after the Trade authority fence is qualified.",
  },
  {
    label: "Shipments",
    description: "See real transport milestones only after the TMS provider binding is live.",
  },
  {
    label: "Documents",
    description: "Retrieve documentary records through the approved custody provider.",
  },
  {
    label: "Invoices",
    description:
      "Show financial consequences only after ERP permissions and reconciliation are qualified.",
  },
] as const

export function BuyerWorkspaceModules() {
  return (
    <section aria-labelledby="buyer-modules-title" className="mt-10">
      <p className="eyebrow">Procurement workspace</p>
      <h2 id="buyer-modules-title" className="mt-3 font-display text-3xl">
        The complete trading journey.
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        These are the planned commercial workspace modules shown in the Figma prototype. They remain
        read-only descriptions until the relevant permissions, providers and evidence are qualified.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pendingModules.map((module) => (
          <Card key={module.label} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-clay-on-light">
              Restricted
            </p>
            <h3 className="mt-3 font-display text-xl">{module.label}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{module.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
