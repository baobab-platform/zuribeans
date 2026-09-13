import type { Metadata } from "next"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getMarketContext } from "@/lib/market/request"
import { hasCustomerSession } from "@/lib/auth/session-storage"
import { StructuredData } from "@/components/seo/structured-data"
import { getOrganizationStructuredData } from "@/lib/seo/structured-data"
import "./globals.css"

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
const siteDescription =
  "B2B sourcing and cross-border trade for quality African coffee, vanilla and future product classes."

export const metadata: Metadata = {
  title: {
    default: "ZuriBeans — African products, traded with rigour",
    template: "%s | ZuriBeans",
  },
  description: siteDescription,
  metadataBase: siteUrl,
  openGraph: {
    type: "website",
    siteName: "ZuriBeans",
    title: "ZuriBeans — African products, traded with rigour",
    description: siteDescription,
    url: "/",
    images: [
      {
        url: "/images/zuribeans-origin-trade-hero-v1.webp",
        width: 1536,
        height: 1024,
        alt: "African agricultural products prepared for accountable cross-border trade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZuriBeans — African products, traded with rigour",
    description: siteDescription,
    images: ["/images/zuribeans-origin-trade-hero-v1.webp"],
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [marketContext, hasSession] = await Promise.all([getMarketContext(), hasCustomerSession()])
  return (
    <html lang={marketContext.active.locale}>
      <body className="font-sans antialiased">
        <StructuredData data={getOrganizationStructuredData(siteUrl)} />
        <a
          href="#main"
          className="sr-only z-[70] rounded-control bg-surface px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader marketContext={marketContext} hasSession={hasSession} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter marketContext={marketContext} />
      </body>
    </html>
  )
}
