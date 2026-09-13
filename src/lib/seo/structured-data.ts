export const serializeStructuredData = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c")

export const getOrganizationStructuredData = (siteUrl: URL) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZuriBeans",
  url: siteUrl.toString(),
  description: "B2B sourcing and cross-border trade for quality African agricultural products.",
  areaServed: [
    { "@type": "Country", name: "Uganda" },
    { "@type": "Country", name: "South Africa" },
  ],
  knowsAbout: [
    "Agricultural sourcing",
    "Coffee",
    "Vanilla",
    "Product provenance",
    "Cross-border trade",
  ],
})
