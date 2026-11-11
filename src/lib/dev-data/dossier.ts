import type { ProductDossierData } from "@/lib/commerce/product-dossier-model"
import type { DemoCommodity, DemoCountry } from "./catalogue"

const countryNames: Record<DemoCountry, string> = {
  UG: "Uganda",
  ZA: "South Africa",
  TZ: "Tanzania",
  KE: "Kenya",
  ET: "Ethiopia",
}
const exportPoints: Record<DemoCountry, string> = {
  UG: "Kampala, Uganda",
  ZA: "Durban, South Africa",
  TZ: "Dar es Salaam, Tanzania",
  KE: "Mombasa, Kenya",
  ET: "Addis Ababa, Ethiopia",
}
const regions: Record<DemoCountry, string> = {
  UG: "Mount Elgon / Bugisu",
  ZA: "KwaZulu-Natal",
  TZ: "Kilimanjaro / Arusha",
  KE: "Central Highlands",
  ET: "Sidama / Yirgacheffe",
}

/**
 * Deterministic, fully populated commercial-style PDP example data.
 * All certificates, availability, laboratory results, documents and terms
 * below are fabricated for visual DEVELOPMENT ONLY. They are never fixtures
 * for native Trade commitments, real document custody, or regulatory permits.
 */
export function buildDemoDossier(product: {
  handle: string
  title: string
  originCountry: DemoCountry
  commodity: DemoCommodity
  hs6: string
  grade: string
  process: string
  packaging: string
  moq: string
  destinationMarkets: readonly DemoCountry[]
  lot: string
}): ProductDossierData {
  const { originCountry, commodity, handle, lot } = product
  const country = countryNames[originCountry]
  const coffee = commodity === "coffee" || commodity === "related"
  const vanilla = commodity === "vanilla"
  const number = [...handle].reduce((value, char) => value + char.charCodeAt(0), 0)
  const prototypeElgon = handle === "demo-arabica-aa-washed-ug"
  const moisture = prototypeElgon ? "10.5–11.5%" : vanilla ? "27.4%" : coffee ? "10.8%" : "12.1%"
  const quality = [
    { label: "Grade", value: product.grade },
    {
      label: "Processing method",
      value: prototypeElgon ? "Fully washed, raised-bed dried" : product.process,
    },
    { label: "Moisture", value: moisture },
    { label: "Foreign matter", value: coffee ? "0.3%" : "0.5%" },
    ...(prototypeElgon
      ? [
          { label: "Defects", value: "≤ 5 full defects / 300g" },
          { label: "Cup Score", value: "84–86 (SCAA)" },
          { label: "Altitude", value: "1,800–2,100 m.a.s.l" },
        ]
      : []),
    { label: "Inspection date", value: "2026-10-20" },
    { label: "Lot sampled", value: lot },
    ...(coffee
      ? [
          {
            label: "Screen specification",
            value: prototypeElgon
              ? "Screen 18 (AA)"
              : product.grade.includes("18")
                ? "Screen 18"
                : "Screen 15–18",
          },
        ]
      : []),
    ...(vanilla
      ? [
          { label: "Vanillin", value: "1.8%" },
          { label: "Average pod length", value: "16–20 cm" },
        ]
      : []),
    ...(commodity === "sorghum"
      ? [
          { label: "Purity", value: "98.6%" },
          {
            label: "Germination (seed only)",
            value: product.hs6 === "100710" ? "92%" : "Not applicable",
          },
        ]
      : []),
  ]
  const certificates = [
    {
      name: prototypeElgon ? "Organic (EU)" : "Organic Certified",
      scheme: "Organic production",
      certificateId: `SYN-ORG-${originCountry}-${number}`,
      issuer: "Example Certification Bureau",
      status: "valid" as const,
      validUntil: "2027-10-31",
      scope: `Synthetic ${commodity} lot`,
    },
    {
      name: prototypeElgon ? "UTZ Certified" : "Rainforest Alliance",
      scheme: "Sustainability certification",
      certificateId: `SYN-RA-${originCountry}-${number}`,
      issuer: "Example Sustainability Auditor",
      status: "valid" as const,
      validUntil: "2027-08-31",
      scope: `Synthetic ${commodity} supply`,
    },
    {
      name: "ISO 22000",
      scheme: "Food safety management",
      certificateId: `SYN-ISO-${originCountry}-${number}`,
      issuer: "Example Food Safety Certification Body",
      status: "valid" as const,
      validUntil: "2028-06-30",
      scope: "Illustrative processing facility",
    },
    {
      name: "EUDR Ready",
      scheme: "Due diligence pack",
      certificateId: `SYN-EUDR-${originCountry}-${number}`,
      issuer: "Example Trade Compliance Office",
      status: "pending" as const,
      validUntil: null,
      scope: "Illustrative due-diligence review — not an official certification",
    },
    ...(prototypeElgon
      ? [
          {
            name: "Full Traceability",
            scheme: "Lot chain of custody",
            certificateId: `SYN-COC-${originCountry}-${number}`,
            issuer: "Example Cooperative Registry",
            status: "valid" as const,
            validUntil: "2027-10-31",
            scope: "Illustrative product lot",
          },
        ]
      : []),
  ]
  const docs = [
    [
      "lab",
      prototypeElgon ? "SGS Pre-Shipment Inspection" : "Quality analysis report",
      "Certificate of analysis",
      "LAB",
      "available",
      "2026-10-20",
    ],
    [
      "origin",
      prototypeElgon ? "ICO Certificate of Origin" : "Certificate of origin",
      "Origin evidence",
      "COO",
      "available",
      "2026-10-19",
    ],
    ["packing", "Packing list", "Trade documentation", "PKL", "available", "2026-10-22"],
    [
      "phyto",
      "Phytosanitary certificate",
      "Plant health documentation",
      "PHY",
      prototypeElgon ? "available" : "review",
      null,
    ],
    ["trace", "Lot traceability report", "Provenance evidence", "TRC", "available", "2026-10-21"],
    [
      "invoice",
      prototypeElgon ? "Cupping Score Sheet" : "Commercial invoice specimen",
      "Commercial documentation",
      "INV",
      "pending",
      null,
    ],
    ...(prototypeElgon
      ? ([
          [
            "organic",
            "Organic EU Certificate (NOP)",
            "Certification",
            "ORG",
            "available",
            "2026-10-18",
          ],
          ["utz", "UTZ Chain of Custody", "Certification", "UTZ", "available", "2026-10-18"],
        ] as const)
      : []),
  ] as const

  return {
    highlights: [
      { label: "Origin", value: country },
      { label: "Grade", value: product.grade },
      { label: "HS code", value: product.hs6 },
      { label: "Lot", value: lot },
    ],
    provenance: [
      { label: "Country of origin", value: country },
      {
        label: "Production region",
        value: prototypeElgon ? "Mount Elgon, Eastern Uganda" : regions[originCountry],
      },
      ...(prototypeElgon
        ? [
            { label: "District", value: "Bulambuli / Sironko" },
            { label: "Rainfall", value: "Bimodal — 800–1,600mm" },
            { label: "Soil", value: "Volcanic loam" },
            { label: "Variety", value: "SL28, SL34, Bourbon" },
            { label: "Altitude", value: "1,800–2,100 m.a.s.l" },
          ]
        : []),
      { label: "Producer", value: `${country} Example Growers Cooperative` },
      { label: "Harvest", value: prototypeElgon ? "2024 Fly Crop (May–Aug)" : "2026 main season" },
      { label: "Lot ID", value: lot },
      { label: "Traceability", value: "Farm → collection → processing → export warehouse" },
      { label: "Processing site", value: `${country} Example Processing Centre` },
      { label: "Coordinates", value: "Filed with synthetic origin record" },
    ],
    quality,
    certifications: certificates,
    documents: docs.map(([id, title, kind, prefix, status, issuedAt]) => ({
      id: `SYN-${id}-${handle}`,
      title,
      kind,
      reference: `SYN-${prefix}-${originCountry}-${number}`,
      status,
      issuedAt,
      issuer: `${country} Example Trade Documentation Office`,
    })),
    terms: {
      incoterms: ["EXW", "FOB", "CIF"],
      namedPlace: prototypeElgon ? "FOB Mombasa / CIF destination" : exportPoints[originCountry],
      transport: "Road / ocean freight; route-specific confirmation",
      packing: product.packaging,
      minimumOrder: prototypeElgon ? "3 x 20ft FCL (approx. 275 bags)" : product.moq,
      samplePolicy: "Sample requests accepted; preparation 3–5 working days",
      payment: "Bank transfer; negotiated buyer-specific terms",
      shippingLeadTime: prototypeElgon
        ? "14–21 days from order confirmation"
        : `${7 + (number % 7)}–${15 + (number % 7)} working days`,
      availableQuantity: `${8 + (number % 9)} metric tonnes`,
      supplyStatus: prototypeElgon ? "Limited — 2024 Fly Crop" : "Available for quotation",
      availabilityAsOf: "2026-10-31",
      destinationMarkets: product.destinationMarkets.map((code) => countryNames[code]),
    },
  }
}
