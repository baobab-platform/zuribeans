import Link from "next/link"
import { notFound } from "next/navigation"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import {
  DEMO_CORRIDORS,
  DEMO_MARKETS,
  DEMO_PRODUCTS,
  DEMO_PRODUCT_CATEGORIES,
} from "@/lib/dev-data/catalogue"
import { DEMO_INSIGHTS } from "@/lib/dev-data/insights"
import { DEMO_DOCUMENT_KINDS, DEMO_LOTS, DEMO_SUPPLIERS } from "@/lib/dev-data/operations"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Development Experience Dataset | ZuriBeans",
  robots: { index: false, follow: false },
}

export default function DevelopmentExperiencePage() {
  if (!isSyntheticExperienceEnabled()) notFound()

  return (
    <section className="bg-canvas py-16">
      <div className="page-container flex flex-col" style={{ gap: "3.5rem" }}>
        <header className="space-y-5">
          <p className="eyebrow">ZB-DEV-DATA v1.0 · local development only</p>
          <h1 className="max-w-4xl font-display text-5xl leading-tight md:text-7xl">
            Trade experience laboratory.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            Deterministic, fictional data for visual and interaction testing. These records are not
            sellable inventory, actual suppliers, active markets, customs determinations, legal
            approvals or commercial commitments.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link className="rounded-control bg-ink px-5 py-3 text-white" href="/products">
              Explore synthetic catalogue
            </Link>
            <Link className="rounded-control border border-line px-5 py-3" href="/insights">
              Browse synthetic Insights
            </Link>
            <Link
              className="rounded-control border border-line px-5 py-3"
              href="/dev/experience/bxs"
            >
              Inspect shared BXS components
            </Link>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Dataset inventory">
          {[
            { label: "Product records", count: DEMO_PRODUCTS.length },
            { label: "Bidirectional markets", count: DEMO_MARKETS.length },
            { label: "Directional corridors", count: DEMO_CORRIDORS.length },
            { label: "Editorial previews", count: DEMO_INSIGHTS.length },
          ].map(({ label, count }) => (
            <div key={label} className="rounded-panel border border-line bg-surface p-6">
              <p className="font-display text-5xl">{count}</p>
              <p className="mt-3 text-sm font-semibold text-muted">{label}</p>
            </div>
          ))}
        </div>

        <section aria-labelledby="dev-market-title">
          <h2 id="dev-market-title" className="font-display text-4xl">
            Five-market network
          </h2>
          <p className="mt-3 max-w-3xl text-muted">
            Every market can be an origin and destination in this preview. Control Plane activation
            and real trade eligibility are not implied.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DEMO_MARKETS.map((market) => (
              <article key={market.code} className="rounded-panel border border-line p-5">
                <p className="eyebrow">
                  {market.code} · {market.currency}
                </p>
                <h3 className="mt-3 font-display text-2xl">{market.name}</h3>
                <p className="mt-2 text-sm text-muted">Origin + destination</p>
                <p className="mt-1 text-xs text-muted">Synthetic / not activated</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="dev-product-title">
          <h2 id="dev-product-title" className="font-display text-4xl">
            Commodity families
          </h2>
          <p className="mt-3 text-muted">
            HS 2022 six-digit reference classifications are informative; national tariff lines, duty
            rates, rules of origin and restrictions require regulatory verification.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.handle}`}
                className="rounded-panel border border-line bg-surface p-6 hover:bg-surface-muted"
              >
                <h3 className="font-display text-2xl">{category.name}</h3>
                <p className="mt-3 text-sm text-muted">
                  {
                    DEMO_PRODUCTS.filter((product) => product.categoryHandle === category.handle)
                      .length
                  }{" "}
                  sample records
                </p>
                <p className="mt-2 text-sm font-semibold">View catalogue →</p>
              </Link>
            ))}
          </div>
          <div className="mt-7 overflow-x-auto rounded-panel border border-line" tabIndex={0}>
            <table className="w-full text-left text-sm" style={{ minWidth: "650px" }}>
              <thead className="bg-surface-muted">
                <tr>
                  <th className="p-4">Example product</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">HS 2022 (6)</th>
                  <th className="p-4">Product page</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_PRODUCTS.slice(0, 15).map((product) => (
                  <tr key={product.id} className="border-t border-line">
                    <td className="p-4">{product.title}</td>
                    <td className="p-4">{product.origin}</td>
                    <td className="p-4 font-mono">{product.hs6}</td>
                    <td className="p-4">
                      <Link href={`/products/${product.handle}`} className="underline">
                        Inspect PDP
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="dev-corridors-title">
          <h2 id="dev-corridors-title" className="font-display text-4xl">
            Directional corridors
          </h2>
          <p className="mt-3 text-muted">
            Each country pair exists in both directions. No lane is approved or rated.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DEMO_CORRIDORS.map((corridor) => (
              <span key={corridor.id} className="rounded-full border border-line px-4 py-2 text-sm">
                {corridor.origin} → {corridor.destination}
              </span>
            ))}
          </div>
        </section>

        <section aria-labelledby="dev-workflows-title">
          <h2 id="dev-workflows-title" className="font-display text-4xl">
            Workflow specimens
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div className="rounded-panel border border-line p-6">
              <h3 className="font-display text-2xl">Suppliers</h3>
              <p className="mt-2 text-muted">{DEMO_SUPPLIERS.length} fictional organisations</p>
              <p className="mt-2 text-sm text-muted">
                No IAM principals, CP entities or verified mandates
              </p>
              <Link
                href="/dev/supplier"
                className="mt-5 inline-block text-sm font-semibold underline"
              >
                Inspect six-step supplier application →
              </Link>
            </div>
            <div className="rounded-panel border border-line p-6">
              <h3 className="font-display text-2xl">Lot genealogy</h3>
              <p className="mt-2 text-muted">{DEMO_LOTS.length} synthetic lot histories</p>
              <p className="mt-2 text-sm text-muted">
                Receiving, sampling and packaging events only
              </p>
            </div>
            <div className="rounded-panel border border-line p-6">
              <h3 className="font-display text-2xl">Documents</h3>
              <p className="mt-2 text-muted">
                {DEMO_DOCUMENT_KINDS.length} specimen document kinds
              </p>
              <p className="mt-2 text-sm text-muted">
                Requirements and validity depend on real corridor decisions
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
