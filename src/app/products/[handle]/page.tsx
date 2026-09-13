import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { cache } from "react"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/state-panel"
import { getMarketContext } from "@/lib/market/request"
import { retrieveProduct } from "@/lib/medusa/products"

export const dynamic = "force-dynamic"

type ProductPageProps = { params: Promise<{ handle: string }> }

const getProductForRequest = cache(async (handle: string) => {
  const { active: market } = await getMarketContext()
  try {
    const product = await retrieveProduct(handle, { countryCode: market.countryCode })
    return { status: "success" as const, product, market }
  } catch {
    return { status: "failure" as const, product: null, market }
  }
})

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params
  const result = await getProductForRequest(handle)
  if (result.status === "failure") {
    return { title: "Product unavailable", robots: { index: false, follow: false } }
  }
  if (!result.product) return { title: "Product not found" }
  return {
    title: result.product.title,
    description:
      result.product.description ||
      result.product.subtitle ||
      `Review ${result.product.title} specifications and sourcing context from ZuriBeans.`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params
  const result = await getProductForRequest(handle)
  if (result.status === "failure") {
    return (
      <section className="page-container py-16">
        <ErrorState
          title="This product cannot be loaded right now."
          description="The trade service did not return current product information. No stored price, availability or eligibility data has been substituted."
          action={{ href: "/products", label: "Return to catalogue" }}
        />
      </section>
    )
  }
  const { product, market } = result
  if (!product) notFound()

  return (
    <article className="page-container py-12 lg:py-16">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-sand">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={`${product.title}${product.origin ? ` from ${product.origin}` : ""}`}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#d9b88d,transparent_40%),linear-gradient(145deg,#526a4f,#172219)]">
              <span className="font-display text-8xl text-white/75" aria-hidden="true">
                Z
              </span>
            </div>
          )}
        </div>

        <div className="self-center">
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{product.origin || "Origin information on request"}</Badge>
            {product.categories.map((category) => (
              <Badge key={category}>{category}</Badge>
            ))}
          </div>
          <h1 className="mt-6 font-display text-5xl leading-tight text-balance md:text-6xl">
            {product.title}
          </h1>
          {product.subtitle ? <p className="mt-4 text-lg text-muted">{product.subtitle}</p> : null}
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted">
            {product.description ||
              "Detailed product and trade specifications are available when published by the authoritative trade service."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`/contact?product=${encodeURIComponent(product.handle)}`} size="lg">
              Request product information
            </ButtonLink>
            <ButtonLink href="/login" variant="outline" size="lg">
              Buyer login
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            Viewing the {market.displayName} market. Buyer-specific price, minimum quantity,
            eligibility and logistics terms are never calculated in the browser.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="font-display text-4xl">Product specification</h2>
          {product.specifications.length ? (
            <dl className="mt-7 overflow-hidden rounded-panel border border-line">
              {product.specifications.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[13rem_1fr]"
                >
                  <dt className="text-sm font-semibold text-muted">{item.label}</dt>
                  <dd className="font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <Card className="mt-7 p-7">
              <p className="font-semibold">Specification details are available on request.</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                ZuriBeans does not infer grade, processing, packaging, availability or Incoterms
                where the trade service has not published them.
              </p>
            </Card>
          )}

          {product.variants.length ? (
            <section className="mt-12" aria-labelledby="available-formats">
              <h2 id="available-formats" className="font-display text-3xl">
                Published formats
              </h2>
              <div className="mt-6 overflow-x-auto rounded-panel border border-line">
                <table className="w-full text-left">
                  <thead className="bg-surface-muted text-sm text-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Format</th>
                      <th className="px-5 py-3 font-semibold">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr key={variant.id} className="border-t border-line">
                        <td className="px-5 py-4 font-medium">{variant.title}</td>
                        <td className="px-5 py-4 text-sm text-muted">
                          {variant.sku || "On request"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card className="p-6">
            <p className="eyebrow">Commercial access</p>
            <h2 className="mt-3 font-display text-2xl">Terms follow authorization.</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Approved buyers receive applicable commercial information through the authenticated
              trading journey.
            </p>
          </Card>
          {product.certifications.length || product.qualityInformation ? (
            <Card className="p-6">
              <p className="eyebrow">Quality record</p>
              {product.qualityInformation ? (
                <p className="mt-3 text-sm leading-6 text-muted">{product.qualityInformation}</p>
              ) : null}
              {product.certifications.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.certifications.map((certification) => (
                    <Badge key={certification} tone="success">
                      {certification}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </Card>
          ) : null}
        </aside>
      </div>
    </article>
  )
}
