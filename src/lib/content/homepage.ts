import type { EvidenceItem } from "@/lib/content/evidence"

export type HomepageCta = {
  label: string
  href: string
}

export type HomeHeroContent = {
  eyebrow: string
  title: string
  accent: string
  description: string
  primaryCta: HomepageCta
  secondaryCta: HomepageCta
  image: {
    src: string
    alt: string
  }
  evidence: {
    eyebrow: string
    statement: string
  }
}

export const HOME_HERO = {
  eyebrow: "African origin. Global reach.",
  title: "Quality products. Clear provenance.",
  accent: "Serious trade.",
  description:
    "ZuriBeans connects professional buyers and qualified suppliers through disciplined sourcing, useful product information and cross-border capability built for repeat business.",
  primaryCta: {
    label: "Request a Quote",
    href: "/contact",
  },
  secondaryCta: {
    label: "Explore products",
    href: "/products",
  },
  image: {
    src: "/images/zuribeans-origin-trade-hero-v1.webp",
    alt: "Green coffee beans, vanilla pods and export-ready sacks at an East African processing facility",
  },
  evidence: {
    eyebrow: "Built for procurement",
    statement: "From a defined requirement to accountable delivery.",
  },
} as const satisfies HomeHeroContent

export const TRUST_EVIDENCE = [
  {
    id: "supplier-verification",
    label: "Supplier verification",
    description: "Supply relationships enter a defined qualification and review process.",
    status: "verified",
    productionVisible: true,
    icon: "supplier-verification",
  },
  {
    id: "traceability",
    label: "Traceability",
    description: "Origin, product and lot context are carried as evidence becomes authoritative.",
    status: "verified",
    productionVisible: true,
    icon: "traceability",
  },
  {
    id: "quality-assurance",
    label: "Quality assurance",
    description: "Declarations and verified information remain visibly distinct.",
    status: "verified",
    productionVisible: true,
    icon: "quality-assurance",
  },
  {
    id: "trade-documentation",
    label: "Trade documentation",
    description: "Commercial and cross-border records follow the accountable trade journey.",
    status: "verified",
    productionVisible: true,
    icon: "trade-documentation",
  },
] as const satisfies readonly EvidenceItem[]
