import { EmptyState } from "@/components/ui/state-panel"

export default function InsightNotFound() {
  return (
    <section className="page-container py-16">
      <EmptyState
        eyebrow="Insight not found"
        title="This article isn't published for your current market."
        description="It may not exist, may not yet be published, or may be scoped to a different market."
        action={{ href: "/insights", label: "Browse all insights" }}
      />
    </section>
  )
}
