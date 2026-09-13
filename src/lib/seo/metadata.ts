import type { Metadata } from "next"

const socialImage = {
  url: "/images/zuribeans-origin-trade-hero-v1.webp",
  width: 1536,
  height: 1024,
  alt: "African agricultural products prepared for accountable cross-border trade",
}

export function getPublicPageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: `/${string}` | "/"
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "ZuriBeans",
      title,
      description,
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  }
}
