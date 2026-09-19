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
