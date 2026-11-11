import { CatalogueTile } from "@/components/commerce/catalogue-tile"
import type { CommodityPresentation } from "@/lib/content/commodity"

export function CommodityCard({ commodity }: { commodity: CommodityPresentation }) {
  return (
    <CatalogueTile
      href={commodity.href}
      title={commodity.name}
      eyebrow={commodity.eyebrow}
      origin={commodity.contextLabel}
      details={commodity.description}
      image={commodity.image.src}
      imageAlt={commodity.image.alt}
      objectPosition={commodity.image.position}
      actionLabel={commodity.actionLabel}
    />
  )
}
