import Image from "next/image"
import Link from "next/link"
import type { ProductCardModel } from "@/lib/medusa/types"

export function ProductCard({ product }: { product: ProductCardModel }) {
  return (
    <article className="group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-panel bg-sand">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt=""
              fill
              sizes="(min-width: 1280px) 29vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#d9b88d,transparent_40%),linear-gradient(145deg,#526a4f,#172219)]">
              <span className="font-display text-5xl text-white/80">Z</span>
            </div>
          )}
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-leaf">
          {product.origin || "African origin"}
        </p>
        <h2 className="mt-2 font-display text-2xl">{product.title}</h2>
        <p className="mt-1 text-sm text-ink/60">
          {product.subtitle || "Specifications and current availability on request"}
        </p>
      </Link>
    </article>
  )
}
