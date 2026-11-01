import { Card } from "@/components/ui/card"

const pendingModules = [
  {
    label: "Requests for quotation",
    description:
      "Send purchasing enquiries and track responses when this service is available.",
  },
  {
    label: "Quotations",
    description:
      "Review quotes and their terms when this service is available.",
  },
  {
    label: "Orders",
    description:
      "View confirmed purchases and track their progress when ordering is available.",
  },
  {
    label: "Shipments",
    description: "Follow deliveries and shipment updates when tracking is available.",
  },
  {
    label: "Documents",
    description: "View documents linked to your purchases when this service is available.",
  },
  {
    label: "Invoices",
    description:
      "View invoices for confirmed purchases when this service is available.",
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
        These services are not available yet. You can use them when they are launched and enabled
        for your organisation.
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
