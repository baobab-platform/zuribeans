export type CommodityPresentation = {
  id: string
  name: string
  description: string
  href: string
  eyebrow: string
  actionLabel: string
  contextLabel: string
  image: {
    src: string
    alt: string
    position?: string
  }
}
