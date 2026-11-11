import type { SupplierFormPrefill } from "@/components/supplier/supplier-application-sections"
import { DEMO_SUPPLIERS } from "./operations"
import { DEMO_MARKETS } from "./catalogue"

export type DemoSupplierJourney = {
  id: string
  label: string
  country: string
  stage:
    "submitted" | "under_review" | "more_information_required" | "sample_required" | "qualification"
  lastStatusDate: string
  lastReviewNote: string
  certificationStatus: "unverified-fixture"
  documents: readonly { type: string; reference: string; status: "submitted" | "requested" }[]
  form: SupplierFormPrefill
}

/** Synthetic supplier journeys are never returned by supplier/repository.ts. */
export const DEMO_SUPPLIER_JOURNEYS: readonly DemoSupplierJourney[] = DEMO_SUPPLIERS.map(
  (supplier, index) => {
    const market = DEMO_MARKETS.find((m) => m.code === supplier.country)
    const country = market?.name ?? "Uganda"
    const categories = ["coffee", "vanilla", "other"] as const
    const stages = [
      "submitted",
      "under_review",
      "more_information_required",
      "sample_required",
      "qualification",
    ] as const
    const category = categories[index % categories.length]
    const cert = ["UTZ / Rainforest Alliance", "Organic (EU)", "ISO 22000"][index % 3]
    return {
      id: supplier.id,
      label: supplier.label,
      country,
      stage: stages[index % stages.length],
      lastStatusDate: "2026-10-31",
      lastReviewNote: [
        "Awaiting identity review",
        "Capacity evidence under review",
        "Please confirm seasonal origin",
        "Sample documentation requested",
        "Qualified sample under assessment",
      ][index % 5],
      certificationStatus: "unverified-fixture" as const,
      documents: [
        {
          type: "Company registration",
          reference: `SYN-REG-${supplier.country}-${index + 1}`,
          status: "submitted" as const,
        },
        {
          type: "Certificate of origin",
          reference: `SYN-COO-${supplier.country}-${index + 1}`,
          status: "requested" as const,
        },
      ],
      form: {
        legalName: supplier.label,
        countryCode: supplier.country,
        registrationNumber: `SYN-REG-${supplier.country}-${index + 1}`,
        taxIdentifier: `SYN-TAX-${supplier.country}-${index + 1}`,
        contactName: "Example Supplier Representative",
        contactRole: "Export Manager",
        contactEmail: `supplier-${index + 1}@example.invalid`,
        contactPhone: "",
        capabilities: [
          {
            category,
            variety:
              category === "coffee"
                ? "SL28 / Bourbon"
                : category === "vanilla"
                  ? "Planifolia"
                  : "Sorghum grain",
            grade:
              category === "coffee"
                ? "AA Screen 18"
                : category === "vanilla"
                  ? "Gourmet"
                  : "Grade 1",
            originCountryCode: supplier.country,
            capacityDescription: `${50 + index * 25} MT per annum`,
            season: "Main crop: October–January; seasonal variation",
            leadTimeDays: 14 + index,
          },
        ],
        certifications: [
          {
            certificationType: cert,
            issuer: "Example Certification Bureau",
            referenceNumber: `SYN-CERT-${supplier.country}-${index + 1}`,
          },
        ],
      },
    }
  },
)
