import { CatalogueTile } from "@/components/commerce/catalogue-tile"
import type { ProductCardModel } from "@/lib/medusa/types"

export function ProductCard({ product }: { product: ProductCardModel }) {
  return (
    <CatalogueTile
      href={"/products/" + encodeURIComponent(product.handle)}
      title={product.cardFacts?.displayName ?? product.title}
      eyebrow="Published catalogue"
      origin={product.origin}
      details={product.subtitle}
      image={product.thumbnail}
      actionLabel="View"
      cardFacts={product.cardFacts}
    />
  )
}
