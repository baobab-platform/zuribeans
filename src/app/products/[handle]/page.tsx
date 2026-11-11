import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import { ProductDossier } from "@/components/commerce/product-dossier"
import { ErrorState } from "@/components/ui/state-panel"
import { StructuredData } from "@/components/seo/structured-data"
import { isSyntheticExperienceEnabled } from "@/lib/dev-data/enablement"
import { getMarketContext } from "@/lib/market/request"
import { retrieveProduct } from "@/lib/medusa/products"

export const dynamic = "force-dynamic"

type ProductPageProps = { params: Promise<{ handle: string }> }

const getProductForRequest = cache(async (handle: string) => {
  const { active: market } = await getMarketContext()
  try {
    const product = await retrieveProduct(handle, {
      countryCode: market.countryCode,
      marketKey: market.marketKey,
    })
    return { status: "success" as const, product, market }
  } catch {
    return { status: "failure" as const, product: null, market }
  }
})

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params
  const canonical = `/products/${encodeURIComponent(handle)}`
  const result = await getProductForRequest(handle)
  if (result.status === "failure") {
    return {
      title: "Product unavailable",
      alternates: { canonical },
      robots: { index: false, follow: false },
    }
  }
  if (!result.product) return { title: "Product not found", alternates: { canonical } }
  const description =
    result.product.description ||
    result.product.subtitle ||
    `Review ${result.product.title} specifications and sourcing context from ZuriBeans.`
  return {
    title: result.product.title,
    description,
    alternates: { canonical },
    ...(isSyntheticExperienceEnabled() ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      title: result.product.title,
      description,
      url: canonical,
      ...(result.product.thumbnail ? { images: [{ url: result.product.thumbnail }] } : {}),
    },
    twitter: {
      card: result.product.thumbnail ? "summary_large_image" : "summary",
      title: result.product.title,
      description,
      ...(result.product.thumbnail ? { images: [result.product.thumbnail] } : {}),
    },
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
  const synthetic = isSyntheticExperienceEnabled()
  const structuredProperties = [
    ...(product.origin
      ? [{ "@type": "PropertyValue", name: "Origin", value: product.origin }]
      : []),
    ...product.specifications.map((item) => ({
      "@type": "PropertyValue",
      name: item.label,
      value: item.value,
    })),
  ]

  return (
    <>
      {!synthetic ? (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description:
              product.description ||
              product.subtitle ||
              `Published sourcing information for ${product.title}.`,
            ...(product.thumbnail ? { image: product.thumbnail } : {}),
            ...(product.categories.length ? { category: product.categories.join(", ") } : {}),
            ...(structuredProperties.length ? { additionalProperty: structuredProperties } : {}),
          }}
        />
      ) : null}
      <ProductDossier
        product={product}
        market={{ displayName: market.displayName, currency: market.currency }}
        synthetic={synthetic}
      />
    </>
  )
}
