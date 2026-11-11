import type { InsightArticle } from "@/lib/content/insights"

/**
 * Fictional editorial previews for typography, filters, cards and PDP links.
 * Not news, investment research, regulatory advice or real market intelligence.
 */
const TOPICS = [
  [
    "Reading a green-coffee quality sheet",
    "quality-compliance",
    "Review grade, process, screen and moisture fields without treating any number as a laboratory result.",
    "Coffee procurement requires product identity, origin context and a traceable lot reference before evaluation.",
    "Illustrative grading labels are not interchangeable across coffee origins. Require buyer-approved specifications.",
  ],
  [
    "Arabica versus Robusta in institutional sourcing",
    "sourcing",
    "A prototype comparison of product classes, roast intent and buyer requirements.",
    "Arabica and Robusta have different grade vocabularies, product profiles and commercial applications.",
    "Use qualification records, not the demonstration comparison, for supplier selection.",
  ],
  [
    "Coffee classification: green and roasted",
    "trade-logistics",
    "An explainer for HS 090111, 090112, 090121 and 090122.",
    "The Harmonized System distinguishes unroasted from roasted and decaffeinated from non-decaffeinated coffee.",
    "National tariff extensions and duty outcomes are excluded until authoritative regulation data is available.",
  ],
  [
    "What a vanilla buyer asks about moisture",
    "quality-compliance",
    "Understand whole pods, cuts, extraction grade and ground product presentations.",
    "Vanilla merchandising uses length, visual quality and moisture specifications that require lot-specific evidence.",
    "Descriptive grades are commercial conventions and not automatically a verified certification.",
  ],
  [
    "Sorghum sourcing: food grain versus seed",
    "sourcing",
    "A sample note on the different seed and non-seed grain classification families.",
    "Sorghum for sowing is classified separately from other grain sorghum in HS 2022.",
    "Seed movement can require specialised authorisations that a visual fixture cannot establish.",
  ],
  [
    "Five markets, bidirectional corridors",
    "market-intelligence",
    "An illustrative network of 20 directional links across East and Southern Africa.",
    "Uganda, South Africa, Kenya, Tanzania and Ethiopia are modelled as possible origins and destinations.",
    "A corridor represents a planned information view, not an approved route, trade agreement or operational carrier.",
  ],
  [
    "Uganda to South Africa: documentary journey",
    "trade-logistics",
    "A visual walk-through of an illustrative coffee shipment evidence chain.",
    "A plausible document workflow can include product identity, invoice, packing list and origin evidence.",
    "Which documents are legally required must be decided for the actual product, jurisdiction, date and transaction.",
  ],
  [
    "South Africa to Uganda: reverse trade lane",
    "trade-logistics",
    "Reverse the country roles to test bidirectional route design.",
    "The buyer and seller market context must be resolved separately for each direction.",
    "Reverse lanes do not inherit tariffs, permissions, provider coverage or seller authority.",
  ],
  [
    "Tanzania and Kenya: sourcing perspectives",
    "market-intelligence",
    "Example market comparison for origin-led procurement user interfaces.",
    "Market cards compare a product's origin, route, packing and published specification.",
    "No current yield, export volume or market price is implied.",
  ],
  [
    "Ethiopian coffee: grade terminology",
    "quality-compliance",
    "Testing specialty catalogue language against country-specific grading descriptions.",
    "Some commercial coffee grade names refer to local conventions rather than global standards.",
    "A synthetic grade must not be treated as an independent certification.",
  ],
  [
    "From cooperative to buyer enquiry",
    "sourcing",
    "A non-transactional demonstration of prospective supplier profile data.",
    "A credible supplier journey separates company identity, site, contact and qualification status.",
    "Synthetic supplier IDs must never become buyer-authorised principals.",
  ],
  [
    "Roasted coffee packaging and formats",
    "sourcing",
    "Display bulk packs, one-kilogram bags and roast-level variants.",
    "A catalogue may distinguish roast intensity, net weight, packaging and best-before information.",
    "Shelf life and food labelling are withheld pending real product documentation.",
  ],
  [
    "How to read a lot genealogy panel",
    "quality-compliance",
    "A synthetic receiving, process and packaging chain for visual review.",
    "Traceability involves explicit links between materials, lots and transformation events.",
    "A demonstration lineage is not proof of real-world custody.",
  ],
  [
    "Why a product image can be missing",
    "company-news",
    "Accessible fallback layouts for product cards and PDPs.",
    "A production-quality interface must cope with incomplete publication metadata.",
    "Image placeholders should not masquerade as verified imagery of an actual lot.",
  ],
  [
    "RFQ and quotation are different states",
    "trade-logistics",
    "Illustrative terminology for controlled buyer/seller workflow screens.",
    "An RFQ expresses demand and a quotation expresses proposed terms subject to proper authority.",
    "Neither should be committed by a public preview or data fixture.",
  ],
  [
    "Coffee extraction ingredients and HS scope",
    "market-intelligence",
    "An example of distinguishing coffee extract from green or roasted beans.",
    "Coffee extracts and concentrates have a different six-digit commodity family from coffee beans.",
    "Composition and legal classification require review of the actual manufactured product.",
  ],
  [
    "Grain sorghum storage checklist",
    "quality-compliance",
    "Sample fields for storage, contamination and handling screens.",
    "A grain lot display may show moisture, impurities, packaging and inspection events.",
    "No synthetic measurement represents a tested lot.",
  ],
  [
    "Supplier documents and their custody",
    "trade-logistics",
    "How a buyer can navigate document status and provenance.",
    "Documentary state should have issuer, holder, revision and verification metadata.",
    "A rendered badge must not become a source of legal verification.",
  ],
  [
    "Markets are not automatically sales permissions",
    "company-news",
    "Separate destination display from CP-authorised trading capabilities.",
    "A visual market can appear in a map without proving an active legal entity or sales channel.",
    "Authoritative market activation must come from the Baobab Control Plane.",
  ],
  [
    "Preparing for engine-owned content",
    "company-news",
    "How synthetic design fixtures are retired as CMS, Trade and ERP qualify.",
    "The website should consume stable public presentation contracts independent of engine implementations.",
    "Preview-only fixtures are replaced by qualified provider projections, never silently mixed with live data.",
  ],
] as const

export const DEMO_INSIGHTS: readonly InsightArticle[] = TOPICS.map(
  ([title, category, excerpt, first, second], index) => ({
    slug: `demo-insight-${String(index + 1).padStart(2, "0")}`,
    title,
    excerpt,
    body: [
      first,
      second,
      "DEVELOPMENT CONTENT: This synthetic article is intended only for layout and interaction testing.",
    ],
    category,
    marketKeys: null,
    publishedAt: new Date(Date.UTC(2026, 9, 1 + index)).toISOString().slice(0, 10),
    authorName: "Synthetic Editorial Preview",
    status: "published" as const,
    canonicalContentId: null,
  }),
)
