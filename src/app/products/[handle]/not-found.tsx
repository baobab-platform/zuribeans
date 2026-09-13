import { EmptyState } from "@/components/ui/state-panel"

export default function ProductNotFound() {
  return (
    <section className="page-container py-16">
      <EmptyState
        eyebrow="Product not found"
        title="This product is not in the current catalogue."
        description="It may no longer be published for this market, or the address may be incorrect."
        action={{ href: "/products", label: "Browse the catalogue" }}
      />
    </section>
  )
}
