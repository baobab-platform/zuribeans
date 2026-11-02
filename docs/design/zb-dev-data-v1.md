# ZB-DEV-DATA v1.0 — Synthetic Experience Programme

Status: **Development fixture / proposed** (not a published product catalogue, source of legal trade truth, or provider acceptance evidence).

## Purpose and activation

This package enables full-page design inspection and deterministic testing of commodities, market corridors, Insights and documentary workflows while Medusa, CP, IAM, CMS, ERP, Regulations, TMS and Pulse are qualified.

To activate **locally only**, start Next.js in development with `ZB_DEV_DATA_MODE=synthetic`. Example: `ZB_DEV_DATA_MODE=synthetic pnpm dev`. Visit `/dev/experience`, `/products`, `/products/demo-arabica-aa-washed-ug`, and `/insights`. Without this explicit environment opt-in the ordinary providers are used. On `NODE_ENV=production` or `test` the flag is ignored and the laboratory returns 404. A real provider failure is never silently replaced with fixture data. No demo fixture is written to a business engine.

## Coverage

- **Five synthetic markets:** Uganda (UG, UGX), South Africa (ZA, ZAR), Kenya (KE, KES), Tanzania (TZ, TZS) and Ethiopia (ET, ETB). All have both origin and destination roles in **20 directed, reverse-paired cross-border corridors**.
- **Runtime market contract stays unchanged:** `zuribeans_ug` and `zuribeans_za` remain the only existing candidate estate market keys. The additional three are design models, **not CP Market registrations**, not Medusa regions, and not IAM entitlements. Real five-market enablement must be reconciled with Shared canonical contracts and Trade/CP.
- **Products:** deterministic country/grade variations for green Arabica and Robusta (including AA, AB, peaberry, G1/G2, multiple screen sizes), roasted coffee (light/medium/dark, decaf), whole and ground vanilla, red/white sorghum and sorghum seed, plus coffee husks and coffee extract. Sample packaging, MOQ, origins, SKU and lot references are _display fields only_.
- **Editorial:** 20 fictional articles across the governed Insights categories, served only through the existing InsightContentProvider's development configuration.
- **Supplier and documentary examples:** 10 fictional organisations, 25 sample lot histories, and nine document categories. No real supplier identity, CP Principal, mandate, certification, inventory, buyer pricing, quotation, order or payment state is created.
- **UI:** existing production component contracts for catalogue, PDP and Insights, plus a segregated development overview with commodity links, HS reference values and corridor badges. No new sales permissions or buyer commitments.

## HS 2022 six-digit reference classifications

| Goods in fixture                                         | HS6    |
| -------------------------------------------------------- | ------ |
| Green coffee, non-decaffeinated                          | 090111 |
| Green coffee, decaffeinated                              | 090112 |
| Roasted coffee, non-decaffeinated                        | 090121 |
| Roasted coffee, decaffeinated                            | 090122 |
| Coffee husks/skins or specified coffee-based substitutes | 090190 |
| Whole vanilla (not crushed or ground)                    | 090510 |
| Crushed/ground vanilla                                   | 090520 |
| Grain sorghum for sowing                                 | 100710 |
| Other grain sorghum                                      | 100790 |
| Extracts/essences/concentrates of coffee                 | 210111 |

Sources (2022 HS nomenclature): [WCO Chapter 09](https://www.wcoomd.org/-/media/wco/public/global/pdf/topics/nomenclature/instruments-and-tools/hs-nomenclature-2022/2022/0209_2022e.pdf?la=en), [WCO Chapter 10](https://www.wcoomd.org/-/media/wco/public/global/pdf/topics/nomenclature/instruments-and-tools/hs-nomenclature-2022/2022/0210_2022e.pdf?la=en), and [USDA Coffee HS crosswalk](https://www.fas.usda.gov/sites/default/files/2024-08/coffee.pdf). The [Kenya Revenue Authority](https://www.kra.go.ke/news-center/public-notices/1733-implementation-of-the-2022-harmonized-system-the-2022-east-african-community-common-external-tariff) confirms 2022 HS/EAC CET adoption. The [SARS tariff schedule](https://www.sars.gov.za/legal-counsel/primary-legislation/schedules-to-the-customs-and-excise-act-1964/) is the proper source for South African rates and legal national lines.

**Classification safeguards:** HS6 identifies an international nomenclature family, **not** an eight-/ten-digit national tariff code, rate, preferential origin, conformity status, restricted import/export permission, licence, sanitary/phytosanitary obligation, or a binding tariff ruling. Grades are contextual commercial sample names, not universal legal grades. The physical composition and processing of coffee preparations, vanilla extracts, sorghum flour and other future processed products must be reviewed separately. The absence of one sample permit does not imply that permit is unnecessary.

## Figma Make product dossier — component migration

The product detail page now uses the layout from the extracted `src/pages/ProductDetail.tsx` in the ZuriBeans Figma Make source:

- Mobile-first commodity/origin identifier, editorial serif product heading, descriptive copy and an early non-committing enquiry link.
- Responsive product image (or a deliberate missing-media treatment), with sticky desktop imagery and procurement information at the right.
- Four keyboard-operable tabs: **Specifications**, **Provenance**, **Quality**, and **Evidence & Docs**. A second fixed mobile enquiry CTA follows the prototype.
- Real data from `retrieveProduct()` (Medusa, or the explicitly enabled development adapter). The same `ProductDetailModel` drives both. No client-calculated pricing, source impersonation, fake stock or pretend certification/document download is permitted.
- Procurement panel shows enquiry-only contexts rather than the prototype's hardcoded 2024 inventory, FOB/CIF quote terms, time-to-ship figures or certification assertions.
- `/contact?product=...` and `/contact?product=...&request=documents` are ordinary, non-binding enquiry links. They do not create an RFQ, sales offer, supplier mandate, order, reservation or documentary authority.
- Development-only fixtures are tagged in the page and receive `noindex`; structured product data is emitted only for actual engine-backed products.

Review layout at 320/390/768/1024/1440 widths, verify keyboard tab switching, focus, no horizontal page overflow, stable mobile sticky CTA and complete quality/documentary negatives. Validate against the Make source visually before accepting updated screenshot baselines.

## Complete Figma PDP data — development fidelity

The product detail view intentionally displays realistic synthetic product facts **without an intrusive disclaimer alongside every field**, because the developer explicitly approved a high-fidelity preview. The whole page remains clearly a _Development preview_, uses fictitious `SYN-*` references and cannot be enabled in staging or production.

Each of the commodity/origin combinations now has a deterministic typed `dossier`:

| Area                 | Data included in the rendered PDP                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Product identity     | Product name, grade, origin, category, HS6, sample lot, packaging variants, SKU                                                                 |
| Provenance           | Producing country and region, cooperative, harvest, lot, processing site, custody-chain narrative and origin-coordinate reference               |
| Quality              | Grade, processing, moisture, foreign matter, inspection, lot sample, screen/vanillin/length/purity/germination where applicable                 |
| Certificates         | Organic, Rainforest Alliance, ISO 22000 and example EUDR due-diligence status; scheme, issuer, certificate ID, status, validity and scope       |
| Documentary register | Sample laboratory analysis, origin evidence, packing list, phytosanitary, lot traceability and invoice, with issuer/reference/issue date/status |
| Availability         | Stock-like quantity, as-of date, shipment lead time                                                                                             |
| Trade terms          | EXW/FOB/CIF examples, named origin place, transport mode, packing, minimum order, sampling policy, negotiated payment text                      |
| Corridor             | Four counterpart destination markets for each origin, across five bidirectional synthetic markets                                               |

**Synthetic statement semantics:** These sample fields are internally consistent _within the development fixture_. For example, an Organic certificate marked `valid` is a valid **example record status**, not independent proof of ZuriBeans certification. No public document download, real customs qualification, legally binding quotation, order, reservation or buyer approval results from the fixture. Never use the fictional issuer, reference or country-specific product values for public certification, compliance or trade reporting.

**Engine migration:** This remains one optional `ProductDetailModel.dossier` projection. Real Medusa/Trade and documentary/quality engines may populate only fields which they actually provide and are authorised to publish. Missing engine fields must remain absent, rather than inheriting fixture facts. Staging/production release requires verified certificates and issuer/expiry provenance, real batch measurements and custody, source-dated stock/transport projections, market/corridor permissions and appropriately qualified payment/incoterm terms.

## Provider substitution — explicit migration

| UI / demo projection                         | Authoritative successor         | Qualification gates                                                                 |
| -------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| Products, variants, media, catalogue filters | Trade / Medusa + CP assortment  | Public publication, market binding, anti-leak, no prices                            |
| Markets and bidirectional corridors          | CP + Trade + Regulations        | Legal actor/market/site grants, classification, sanctions, tariffs, rules of origin |
| Quality and lots                             | ERP / Trade Docs / Pulse        | Evidence custody, provenance, immutable identifiers, revocation                     |
| Suppliers                                    | CP / ERP supplier qualification | Legal identity, buyer/seller mandates and proper approvals                          |
| Articles                                     | Payload CMS                     | Published, market-scoped content and canonical IDs                                  |
| Transport examples                           | TMS and approved carriers       | Real quote/booking/tracking, rejection and replay                                   |
| Buyer activities                             | IAM/CP + Trade + ERP            | No buyer commitment without authoritative principal, scope and native fence         |

## Acceptance and negatives

Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`; exercise local development UI at 320/390/768/1024/1440 widths. Verify category filtering, pagination, PDP specification tables, Insights filters and article navigation. Explicitly test that the demo mode is unavailable in production/test; malformed handles never become products; market activation never derives from fixtures; no synthetic pricing, inventory authority, quotations, binding tariff rates or supplier Principals exist. A failed Medusa/CMS request must keep its ordinary failure state when the demo flag is off.

This package is a **design fixture**, not a replacement for live engine tests or evidence. Synthetic model claims, example data and demo article copy must not be promoted into a staging or public release as business facts.
