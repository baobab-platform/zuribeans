import Image from "next/image"
import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { ProductDossierTabs } from "@/components/commerce/product-dossier-tabs"
import type { ProductDetailModel } from "@/lib/medusa/types"

type MarketContext = { displayName: string; currency: string }

/**
 * Product dossier design ported from Make's ProductDetail.tsx.
 * All commercial action links remain non-committing and preserve existing
 * authority. Development fixtures render complete commercial-like facts,
 * while real products only render fields published by their owning providers.
 */
export function ProductDossier({
  product,
  market,
  synthetic,
}: {
  product: ProductDetailModel
  market: MarketContext
  synthetic: boolean
}) {
  const inquiryHref = `/contact?product=${encodeURIComponent(product.handle)}`
  const documentaryHref = `/contact?product=${encodeURIComponent(product.handle)}&request=documents`
  const productName = product.title.split(" — ")[0]
  const subtitle = product.subtitle ?? product.origin
  const terms = product.dossier?.terms
  const commercialFacts = [
    { label: "Market", value: market.displayName },
    { label: "Available quantity", value: terms?.availableQuantity ?? "Request confirmation" },
    ...(terms ? [{ label: "Supply status", value: terms.supplyStatus }] : []),
    { label: "As of", value: terms?.availabilityAsOf ?? "Not published" },
    { label: "Minimum order", value: terms?.minimumOrder ?? "Confirm with trade desk" },
    { label: "Shipment lead time", value: terms?.shippingLeadTime ?? "On quotation" },
    { label: "Incoterms", value: terms?.incoterms.join(" / ") ?? "Subject to quotation" },
    { label: "Named place", value: terms?.namedPlace ?? "Subject to quotation" },
    { label: "Transport", value: terms?.transport ?? "On quotation" },
    { label: "Packing", value: terms?.packing ?? "As published in specifications" },
    { label: "Samples", value: terms?.samplePolicy ?? "On request" },
    { label: "Payment", value: terms?.payment ?? "After buyer authorisation" },
  ]
  const imageAlt = `${product.title}${product.origin ? ` from ${product.origin}` : ""}`
  const image = (
    <div
      className="relative overflow-hidden rounded-panel bg-sand"
      style={{ aspectRatio: "4 / 3" }}
    >
      {product.thumbnail ? (
        <Image
          src={product.thumbnail}
          alt={imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 38vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, #d9b88d, transparent 40%), linear-gradient(145deg, #526a4f, #172219)",
          }}
        >
          <span aria-hidden="true" className="font-display text-7xl text-white/75">
            Z
          </span>
          <span className="sr-only">Product image not published</span>
        </div>
      )}
    </div>
  )

  return (
    <article className="min-w-0 bg-canvas pb-28 lg:pb-0">
      <div className="border-b border-line bg-surface-muted">
        <div className="page-container py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.title },
            ]}
          />
        </div>
      </div>

      <div className="page-container">
        <div className="grid min-w-0 gap-10 py-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span
                className="font-semibold uppercase text-clay-on-light"
                style={{ letterSpacing: ".12em" }}
              >
                {product.categories[0] || "Commodity"}
              </span>
              {product.origin ? (
                <>
                  <span aria-hidden="true" className="text-muted">
                    ·
                  </span>
                  <span className="text-muted">{product.origin}</span>
                </>
              ) : null}
              {synthetic ? <Badge tone="info">Development preview</Badge> : null}
            </div>
            <h1
              className="max-w-3xl font-display font-light text-ink"
              style={{
                fontSize: "clamp(2rem, 4.2vw, 3.3rem)",
                lineHeight: 1.12,
                letterSpacing: "-.02em",
              }}
            >
              {productName}
              {subtitle ? (
                <em
                  className="mt-2 block font-light text-muted-strong"
                  style={{ fontSize: ".78em" }}
                >
                  {subtitle}
                </em>
              ) : null}
            </h1>

            {product.certifications.length ? (
              <div
                className="mt-5 flex flex-wrap gap-2"
                aria-label="Published product certification labels"
              >
                {product.certifications.map((certificate) => (
                  <Badge key={certificate} tone="info">
                    {certificate}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="mt-7 lg:hidden">{image}</div>
            <p className="mt-6 max-w-2xl text-muted" style={{ fontSize: "15px", lineHeight: 1.75 }}>
              {product.description ||
                "Detailed origin, grade and trade specifications will appear when published by the product provider."}
            </p>
            <p className="mt-4 text-sm leading-6 text-muted">
              Viewing {market.displayName} ({market.currency}).
              {terms
                ? " Product-specific shipping, availability and trade terms are detailed in the procurement panel."
                : " Commercial terms and availability are confirmed through authorised trade channels."}
            </p>
            {product.dossier?.highlights.length ? (
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.dossier.highlights.map((entry) => (
                  <div key={entry.label} className="border-l-2 border-clay pl-3">
                    <dt className="text-xs uppercase text-muted" style={{ letterSpacing: ".08em" }}>
                      {entry.label}
                    </dt>
                    <dd className="mt-1 font-semibold text-ink">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {terms ? (
              <div className="mt-6 grid grid-cols-2 gap-3 rounded-panel border border-line bg-surface p-4 lg:hidden">
                <div>
                  <p className="text-xs text-muted">Available quantity</p>
                  <p className="mt-1 font-display text-xl">{terms.availableQuantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Shipping lead time</p>
                  <p className="mt-1 font-display text-xl">{terms.shippingLeadTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Incoterms</p>
                  <p className="mt-1 text-sm font-semibold">{terms.incoterms.join(" / ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Minimum order</p>
                  <p className="mt-1 text-sm font-semibold">{terms.minimumOrder}</p>
                </div>
              </div>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3 lg:hidden">
              <Link
                href={inquiryHref}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-ink px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Request a Quotation <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={documentaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-line-strong px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-muted"
              >
                Request Documents
              </Link>
            </div>

            <div className="mt-12">
              <ProductDossierTabs product={product} />
            </div>
          </div>

          <aside
            className="hidden min-w-0 lg:col-span-5 lg:block"
            aria-label="Product procurement enquiry"
          >
            <div className="sticky top-24 space-y-5">
              {image}
              <div className="rounded-panel border border-line-strong bg-surface p-6">
                <p className="eyebrow">Procurement</p>
                <h2 className="mt-3 font-display text-2xl">Discuss this product</h2>
                <dl className="mt-5 divide-y divide-line text-sm">
                  {commercialFacts.map((entry) => (
                    <div
                      key={entry.label}
                      className="grid gap-3 py-3"
                      style={{ gridTemplateColumns: "8.5rem minmax(0, 1fr)" }}
                    >
                      <dt className="text-muted">{entry.label}</dt>
                      <dd className="min-w-0 break-words font-semibold">{entry.value}</dd>
                    </div>
                  ))}
                  {terms?.destinationMarkets.length ? (
                    <div className="py-3">
                      <dt className="text-muted">Trade destinations</dt>
                      <dd className="mt-3 flex flex-wrap gap-2">
                        {terms.destinationMarkets.map((name) => (
                          <span
                            key={name}
                            className="rounded-full border border-line px-3 py-1 text-xs font-semibold"
                          >
                            {name}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <Link
                  href={inquiryHref}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-ink px-5 py-3 text-sm font-bold text-white hover:opacity-90"
                >
                  Request a Quotation <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href={documentaryHref}
                  className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control border border-line-strong px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-muted"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  Request Sample Documents
                </Link>
                <Link
                  href="/login"
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-control px-5 py-2 text-sm font-semibold text-ink underline underline-offset-4"
                >
                  Buyer login
                </Link>
                <p className="mt-4 text-xs leading-5 text-muted">
                  Enquiry only. No order, inventory reservation, binding offer or buyer approval is
                  created by this page.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas p-3 shadow-lg lg:hidden">
        <div className="page-container">
          <Link
            href={inquiryHref}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-ink px-5 py-3 text-sm font-bold text-white"
          >
            Request a Quotation <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
