import { buildDemoDossier } from "./dossier"
import type { ProductCategoryModel, ProductDetailModel, ProductListModel } from "@/lib/medusa/types"

/**
 * ZB-DEV-DATA v1: immutable, deterministic VISUAL-TEST fixtures.
 * Never create Medusa IDs, commercial offers or a CP Market authority from these.
 * HS codes are indicative six-digit HS 2022 classification families only.
 */
export type DemoCountry = "UG" | "ZA" | "TZ" | "KE" | "ET"
export type DemoCommodity = "coffee" | "vanilla" | "sorghum" | "sesame" | "rooibos" | "related"
export type DemoMarket = {
  code: DemoCountry
  name: string
  currency: string
  marketKey: string
  role: "bidirectional"
  readiness: "synthetic"
}
export const DEMO_MARKETS: readonly DemoMarket[] = [
  {
    code: "UG",
    name: "Uganda",
    currency: "UGX",
    marketKey: "zuribeans_ug",
    role: "bidirectional",
    readiness: "synthetic",
  },
  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    marketKey: "zuribeans_za",
    role: "bidirectional",
    readiness: "synthetic",
  },
  {
    code: "TZ",
    name: "Tanzania",
    currency: "TZS",
    marketKey: "zuribeans_tz",
    role: "bidirectional",
    readiness: "synthetic",
  },
  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    marketKey: "zuribeans_ke",
    role: "bidirectional",
    readiness: "synthetic",
  },
  {
    code: "ET",
    name: "Ethiopia",
    currency: "ETB",
    marketKey: "zuribeans_et",
    role: "bidirectional",
    readiness: "synthetic",
  },
] as const

export type DemoCorridor = {
  id: string
  origin: DemoCountry
  destination: DemoCountry
  status: "illustrative-unqualified"
  commercialTerms: null
  tariffRate: null
  customsDecision: null
}
export const DEMO_CORRIDORS: readonly DemoCorridor[] = DEMO_MARKETS.flatMap((origin) =>
  DEMO_MARKETS.filter((destination) => destination.code !== origin.code).map((destination) => ({
    id: `demo-corridor-${origin.code.toLowerCase()}-${destination.code.toLowerCase()}`,
    origin: origin.code,
    destination: destination.code,
    status: "illustrative-unqualified" as const,
    commercialTerms: null,
    tariffRate: null,
    customsDecision: null,
  })),
)

export const DEMO_HS2022 = {
  "090111": "Coffee, not roasted, not decaffeinated",
  "090112": "Coffee, not roasted, decaffeinated",
  "090121": "Coffee, roasted, not decaffeinated",
  "090122": "Coffee, roasted, decaffeinated",
  "090190": "Coffee husks and skins, and coffee-based substitutes",
  "090510": "Vanilla, neither crushed nor ground",
  "090520": "Vanilla, crushed or ground",
  "100710": "Grain sorghum, seed",
  "100790": "Grain sorghum, other than seed",
  "120740": "Sesamum seeds, whether or not broken",
  "121299": "Other vegetable products used primarily for human consumption",
  "210111": "Extracts, essences and concentrates of coffee",
} as const

export type DemoProduct = ProductDetailModel & {
  fixture: true
  fixtureVersion: "ZB-DEV-DATA-1.0"
  originCountry: DemoCountry
  categoryHandle: DemoCommodity
  hs6: keyof typeof DEMO_HS2022
  hsEdition: "HS2022"
  tariffNationalExtension: null
  destinationMarkets: readonly DemoCountry[]
  lot: string
  documentaryState: "sample-only"
  quotation: null
  inventoryAuthority: null
  supplierPrincipal: null
}

type GradeTemplate = {
  key: string
  title: string
  commodity: DemoCommodity
  hs6: keyof typeof DEMO_HS2022
  originCodes: readonly DemoCountry[]
  grade: string
  process: string
  packaging: string
  moq: string
  description: string
}

const TEMPLATES: readonly GradeTemplate[] = [
  {
    key: "arabica-aa-washed",
    title: "Arabica AA washed green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["UG", "KE", "TZ", "ET"],
    grade: "AA (illustrative merchant grade)",
    process: "Washed",
    packaging: "60 kg jute or GrainPro-lined",
    moq: "600 kg",
    description: "High-grade green Arabica for importer and roaster catalogue layout tests.",
  },
  {
    key: "arabica-ab-washed",
    title: "Arabica AB washed green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["UG", "KE", "TZ"],
    grade: "AB (illustrative)",
    process: "Washed",
    packaging: "60 kg",
    moq: "600 kg",
    description: "Screen-sorted Arabica; grade terminology requires origin-specific review.",
  },
  {
    key: "arabica-a-natural",
    title: "Arabica A natural green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["ET", "UG", "TZ"],
    grade: "A (illustrative)",
    process: "Natural",
    packaging: "60 kg",
    moq: "600 kg",
    description: "Natural-process sample lot for a detailed green-coffee product page.",
  },
  {
    key: "arabica-pb",
    title: "Arabica peaberry green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["TZ", "KE", "UG"],
    grade: "PB (illustrative)",
    process: "Washed",
    packaging: "60 kg",
    moq: "600 kg",
    description: "Peaberry screen lot for evaluating grade and lot differences.",
  },
  {
    key: "arabica-g1",
    title: "Arabica specialty Grade 1 green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["ET", "UG"],
    grade: "Grade 1 (origin-dependent)",
    process: "Washed",
    packaging: "60 kg",
    moq: "600 kg",
    description: "Illustrative specialty evaluation; not a cupping-score or certification claim.",
  },
  {
    key: "arabica-g2",
    title: "Arabica Grade 2 green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["ET", "UG"],
    grade: "Grade 2 (origin-dependent)",
    process: "Natural",
    packaging: "60 kg",
    moq: "600 kg",
    description: "Grade and processing detail for procurement comparison.",
  },
  {
    key: "robusta-sc18",
    title: "Robusta screen 18 green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["UG", "TZ"],
    grade: "Screen 18",
    process: "Natural",
    packaging: "60 kg",
    moq: "1,200 kg",
    description: "Large-screen green Robusta for commercial roasting scenarios.",
  },
  {
    key: "robusta-sc15",
    title: "Robusta screen 15 green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["UG", "TZ"],
    grade: "Screen 15",
    process: "Natural",
    packaging: "60 kg",
    moq: "1,200 kg",
    description: "Medium-screen green Robusta for coffee procurement comparisons.",
  },
  {
    key: "robusta-faq",
    title: "Robusta FAQ green coffee",
    commodity: "coffee",
    hs6: "090111",
    originCodes: ["UG", "TZ"],
    grade: "FAQ (illustrative commercial descriptor)",
    process: "Natural",
    packaging: "60 kg",
    moq: "1,200 kg",
    description: "Fair-average-quality label is not a universally comparable grade.",
  },
  {
    key: "green-decaf",
    title: "Decaffeinated green Arabica",
    commodity: "coffee",
    hs6: "090112",
    originCodes: ["ZA", "ET"],
    grade: "Buyer specification",
    process: "Decaffeinated, unroasted",
    packaging: "30 kg",
    moq: "300 kg",
    description: "Demonstrates the separate HS classification for green decaf.",
  },
  {
    key: "roasted-light",
    title: "Light roasted Arabica whole beans",
    commodity: "coffee",
    hs6: "090121",
    originCodes: ["ZA", "KE", "UG", "ET"],
    grade: "Light roast",
    process: "Roasted, not decaffeinated",
    packaging: "1 kg valve bags",
    moq: "24 kg",
    description: "Wholesale roasted coffee presentation without prices or stock promises.",
  },
  {
    key: "roasted-medium",
    title: "Medium roasted coffee whole beans",
    commodity: "coffee",
    hs6: "090121",
    originCodes: ["ZA", "KE", "TZ", "UG"],
    grade: "Medium roast",
    process: "Roasted, not decaffeinated",
    packaging: "1 kg valve bags",
    moq: "24 kg",
    description: "Wholesale medium-roast example for cafes and institutional buyers.",
  },
  {
    key: "roasted-dark",
    title: "Dark roasted Robusta blend",
    commodity: "coffee",
    hs6: "090121",
    originCodes: ["ZA", "UG"],
    grade: "Dark roast",
    process: "Roasted, not decaffeinated",
    packaging: "1 kg valve bags",
    moq: "24 kg",
    description: "Illustrative roast-level differentiation, not a disclosed recipe.",
  },
  {
    key: "roasted-decaf",
    title: "Decaffeinated roasted Arabica",
    commodity: "coffee",
    hs6: "090122",
    originCodes: ["ZA", "KE"],
    grade: "Medium roast",
    process: "Roasted and decaffeinated",
    packaging: "1 kg valve bags",
    moq: "24 kg",
    description: "Separate HS category for roasted decaf.",
  },
  {
    key: "vanilla-gourmet",
    title: "Whole cured gourmet vanilla pods",
    commodity: "vanilla",
    hs6: "090510",
    originCodes: ["UG", "TZ", "KE"],
    grade: "Gourmet / Grade A (illustrative)",
    process: "Cured, whole",
    packaging: "Vacuum packs 1 kg",
    moq: "10 kg",
    description: "Whole vanilla beans with illustrative grade, length and moisture information.",
  },
  {
    key: "vanilla-extraction",
    title: "Whole extraction-grade vanilla pods",
    commodity: "vanilla",
    hs6: "090510",
    originCodes: ["UG", "TZ"],
    grade: "Extraction / Grade B (illustrative)",
    process: "Cured, whole",
    packaging: "Vacuum packs 1 kg",
    moq: "10 kg",
    description: "Extraction-grade vanilla for industrial flavour supply.",
  },
  {
    key: "vanilla-cuts",
    title: "Vanilla cuts and splits",
    commodity: "vanilla",
    hs6: "090510",
    originCodes: ["UG", "TZ"],
    grade: "Cuts / splits",
    process: "Cured, whole pieces",
    packaging: "Vacuum packs 5 kg",
    moq: "25 kg",
    description: "Whole or cut vanilla samples; verify classification against physical form.",
  },
  {
    key: "vanilla-powder",
    title: "Ground vanilla powder",
    commodity: "vanilla",
    hs6: "090520",
    originCodes: ["UG", "TZ", "ZA"],
    grade: "Ground",
    process: "Crushed or ground",
    packaging: "Food-grade packs 1 kg",
    moq: "10 kg",
    description: "Ground vanilla is distinguished from whole pods by HS subheading.",
  },
  {
    key: "sorghum-red",
    title: "Red grain sorghum",
    commodity: "sorghum",
    hs6: "100790",
    originCodes: ["UG", "ZA", "TZ", "KE", "ET"],
    grade: "Red grain (illustrative)",
    process: "Cleaned and dried",
    packaging: "50 kg woven sacks",
    moq: "1,000 kg",
    description: "Food or industrial grain presentation; end-use is not automatically certified.",
  },
  {
    key: "sorghum-white",
    title: "White grain sorghum",
    commodity: "sorghum",
    hs6: "100790",
    originCodes: ["UG", "ZA", "TZ", "KE", "ET"],
    grade: "White grain (illustrative)",
    process: "Cleaned and dried",
    packaging: "50 kg woven sacks",
    moq: "1,000 kg",
    description: "Bulk sorghum grain comparison with moisture and impurity placeholders.",
  },
  {
    key: "sorghum-seed",
    title: "Sorghum grain for sowing",
    commodity: "sorghum",
    hs6: "100710",
    originCodes: ["ZA", "KE", "ET"],
    grade: "Seed (unqualified demonstration)",
    process: "Seed, not food grain",
    packaging: "25 kg sacks",
    moq: "250 kg",
    description:
      "Separate seed HS category; seed certification and phytosanitary permission not asserted.",
  },
  {
    key: "sesame-hulled",
    title: "Hulled sesame seeds",
    commodity: "sesame",
    hs6: "120740",
    originCodes: ["UG"],
    grade: "99.95% purity (illustrative)",
    process: "Machine-cleaned, hulled",
    packaging: "25 kg food-grade sacks",
    moq: "1,000 kg",
    description: "Synthetic sesame catalogue lot for Figma procurement interface qualification.",
  },
  {
    key: "rooibos-grade1",
    title: "Rooibos Grade 1",
    commodity: "rooibos",
    hs6: "121299",
    originCodes: ["ZA"],
    grade: "Fine cut (illustrative)",
    process: "Fermented and dried",
    packaging: "20 kg food-grade bags",
    moq: "200 kg",
    description: "Synthetic Rooibos catalogue lot; tariff classification is indicative, not a customs ruling.",
  },
  {
    key: "coffee-husks",
    title: "Coffee husks and skins",
    commodity: "related",
    hs6: "090190",
    originCodes: ["UG", "KE", "ET"],
    grade: "By-product",
    process: "Dried husks",
    packaging: "50 kg",
    moq: "500 kg",
    description: "Coffee by-product visual fixture; legal classification must be confirmed.",
  },
  {
    key: "coffee-concentrate",
    title: "Coffee extract concentrate",
    commodity: "related",
    hs6: "210111",
    originCodes: ["ZA", "KE"],
    grade: "Food ingredient",
    process: "Concentrated coffee extract",
    packaging: "Food-grade 5 kg",
    moq: "50 kg",
    description: "Related processed ingredient distinct from roasted beans.",
  },
] as const

export const DEMO_PRODUCT_CATEGORIES: readonly ProductCategoryModel[] = [
  { id: "demo-category-coffee", handle: "coffee", name: "Coffee" },
  { id: "demo-category-vanilla", handle: "vanilla", name: "Vanilla" },
  { id: "demo-category-sorghum", handle: "sorghum", name: "Sorghum" },
  { id: "demo-category-related", handle: "related", name: "Related products" },
  { id: "demo-category-sesame", handle: "sesame", name: "Grains & Seeds" },
  { id: "demo-category-rooibos", handle: "rooibos", name: "Botanicals" },
]

export const DEMO_PRODUCTS: readonly DemoProduct[] = TEMPLATES.flatMap((template) =>
  template.originCodes.map((originCountry) => {
    const origin = DEMO_MARKETS.find((market) => market.code === originCountry)!
    const handle = `demo-${template.key}-${originCountry.toLowerCase()}`
    const title = `${template.title} — ${origin.name}`
    const demoSku = `DEMO-${originCountry}-${template.key.toUpperCase()}`
    const grade =
      template.key === "arabica-aa-washed" && originCountry === "UG"
        ? "AA, Screen 18"
        : template.grade.replace(/\s*\([^)]*\)/g, "")
    const description =
      template.key === "arabica-aa-washed" && originCountry === "UG"
        ? "Single-origin Arabica from the slopes of Mount Elgon, Eastern Uganda. Fully washed and raised-bed dried at altitude. Clear citric acidity, clean cup, good body. 2024 fly crop. Full documentation available."
        : `${template.title} sourced from ${origin.name}. ${template.process} production, packed as ${template.packaging}. Grade: ${grade}. Specifications, trade documents and procurement information are shown in the dossier.`
    const lot = `SYN-${originCountry}-${template.key.toUpperCase()}`
    const destinationMarkets = DEMO_MARKETS.filter((m) => m.code !== originCountry).map(
      (m) => m.code,
    )
    const dossier = buildDemoDossier({
      handle,
      title,
      originCountry,
      commodity: template.commodity,
      hs6: template.hs6,
      grade,
      process: template.process,
      packaging: template.packaging,
      moq: template.moq,
      destinationMarkets,
      lot,
    })
    return {
      id: `fixture-${handle}`,
      handle,
      title,
      subtitle: `${grade} · ${template.process}`,
      description,
      thumbnail:
        template.key === "robusta-faq"
          ? "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=700&h=520&fit=crop&auto=format"
          : template.key === "arabica-aa-washed"
            ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&h=520&fit=crop&auto=format"
            : template.key === "vanilla-gourmet"
              ? "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=700&h=520&fit=crop&auto=format"
              : template.key === "sesame-hulled"
                ? "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=700&h=520&fit=crop&auto=format"
                : template.key === "rooibos-grade1"
                  ? "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=700&h=520&fit=crop&auto=format"
                  : "/images/zuribeans-origin-trade-hero-v1.webp",
      origin: origin.name,
      cardFacts: {
        source: "synthetic" as const,
        displayName:
          template.key === "robusta-faq"
            ? "Robusta Coffee"
            : template.key === "arabica-aa-washed"
              ? "Arabica Coffee"
              : template.key === "vanilla-gourmet"
                ? "Vanilla Planifolia"
                : template.key === "sesame-hulled"
                  ? "Sesame Seeds"
                  : template.key === "rooibos-grade1"
                    ? "Rooibos"
                    : template.title,
        category:
          DEMO_PRODUCT_CATEGORIES.find((category) => category.handle === template.commodity)?.name ??
          "Agricultural commodities",
        grade,
        process: template.process,
        certification:
          template.key === "robusta-faq"
            ? "UTZ / RA (sample)"
            : template.key === "arabica-aa-washed"
              ? "Organic (EU) / UTZ (sample)"
              : template.key === "vanilla-gourmet"
                ? "Organic readiness (sample)"
                : template.key === "sesame-hulled"
                  ? "Phytosanitary (sample)"
                  : "Certification specimen",
        supplyStatus: template.key === "arabica-aa-washed" ? "Limited" as const : "Available" as const,
        harvest: "Illustrative 2026 crop",
        minimumOrder: template.moq,
        incoterms: dossier.terms?.incoterms.join(" / "),
      },
      originCountry,
      categoryHandle: template.commodity,
      categories: [
        DEMO_PRODUCT_CATEGORIES.find((category) => category.handle === template.commodity)!.name,
      ],
      certifications: dossier.certifications.map((item) => item.name),
      qualityInformation:
        "Sample analysis: moisture, grading and inspection values available in the Quality dossier.",
      dossier,
      specifications: [
        { label: "HS 2022 (6 digits)", value: template.hs6 },
        { label: "Grade", value: grade },
        { label: "Processing", value: template.process },
        { label: "Packaging", value: template.packaging },
        { label: "Minimum order", value: dossier.terms?.minimumOrder ?? template.moq },
        { label: "Origin", value: origin.name },
        { label: "Lot reference", value: lot },
        { label: "Lead Time", value: dossier.terms?.shippingLeadTime ?? "On request" },
        ...dossier.quality.filter((field) =>
          ["Cup Score", "Defects", "Moisture", "Altitude"].includes(field.label),
        ),
      ],
      variants: [{ id: `fixture-variant-${handle}`, title: template.packaging, sku: demoSku }],
      fixture: true,
      fixtureVersion: "ZB-DEV-DATA-1.0" as const,
      hs6: template.hs6,
      hsEdition: "HS2022" as const,
      tariffNationalExtension: null,
      destinationMarkets,
      lot,
      documentaryState: "sample-only" as const,
      quotation: null,
      inventoryAuthority: null,
      supplierPrincipal: null,
    }
  }),
)

/** Curated four-card synthetic showcase: exactly the Figma Make commodity mix. */
export const DEMO_FEATURED_HANDLES = [
  "demo-robusta-faq-ug",
  "demo-arabica-aa-washed-ug",
  "demo-vanilla-gourmet-ug",
  "demo-sesame-hulled-ug",
] as const

export function getDemoFeaturedProducts(): ProductListModel {
  const items = DEMO_FEATURED_HANDLES.flatMap((handle) => {
    const product = DEMO_PRODUCTS.find((candidate) => candidate.handle === handle)
    return product ? [product] : []
  })
  return { items, count: items.length, limit: 4, offset: 0 }
}

export function listDemoProducts(options: {
  query?: string
  categoryId?: string
  limit?: number
  offset?: number
}): ProductListModel {
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 100)
  const offset = Math.max(options.offset ?? 0, 0)
  const category = DEMO_PRODUCT_CATEGORIES.find((entry) => entry.id === options.categoryId)
  const q = (options.query ?? "").trim().toLowerCase()
  const matches = DEMO_PRODUCTS.filter(
    (product) =>
      (!options.categoryId ||
        (category !== undefined && product.categoryHandle === category.handle)) &&
      (!q ||
        [
          product.title,
          product.subtitle,
          product.description,
          product.origin,
          product.hs6,
          product.lot,
        ].some((text) => text?.toLowerCase().includes(q))),
  )
  return { items: matches.slice(offset, offset + limit), count: matches.length, offset, limit }
}

export function getDemoProduct(handle: string): ProductDetailModel | null {
  return DEMO_PRODUCTS.find((product) => product.handle === handle) ?? null
}
