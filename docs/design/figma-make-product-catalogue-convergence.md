# Figma Make component migration — 03: Homepage commodities and procurement catalogue

**Status:** Proposed in ZuriBeans PR #145; **do not merge pending design acceptance**.  
**Design reference:** [ZuriBeans Figma Make](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype) — `src/components/Commodities.tsx` and `src/pages/Products.tsx`.

## Implemented boundaries

1. **Homepage:** Four-slot published product discovery where the market-scoped Medusa/Trade provider supplies them; otherwise, curated product-class cards are displayed as category **discovery**, not substitute stock. A provider failure never produces fictitious inventory. The approved hero and trust ribbon are untouched.
2. **Product cards:** Shared `CatalogueTile` provides 4:3 media, a small uppercase hierarchy label, serif title, origin and published supporting details, fine dividers, and an explicit product-navigation action. Both the homepage and catalogue use the same presentational primitive.
3. **Catalogue:** `/products` adopts the dark forest-green editorial header, sticky search/category toolbar, responsive dense card grid, readable empty/error states, and existing paginated product traversal.
4. **Mobile:** One-column product cards where space demands it, full-width search first, and a keyboard-accessible native `details` filter sheet (no new client JavaScript). Category selection and search remain URL-backed server navigation. Tablet transitions to a two-column grid; desktop uses up to four columns.

## What the Figma prototype does NOT authorise

- Prototype `Robusta Coffee`, `Arabica Coffee`, `Vanilla Planifolia`, `Sesame Seeds`, `Rooibos` and their imagery, 2024 harvest dates, grades, certifications, prices, shipping statuses, or availability are **not real catalogue records** and are not imported into the production store.
- Product titles, origin, subtitle, and product thumbnails derive exclusively from `listProducts` and the Medusa published projection, with `marketKey` preserving Trade assortment gating; no direct client-side product IDs, mock prices or fake product detail routes.
- The existing `PUBLIC_PRODUCT_CLASSES` supports an explicitly class-level fallback for discovery. Its two entries link to real catalogue category URLs and do not represent product listings.
- `listProductCategories`, `parseCatalogueQuery`, `catalogueHref`, market context, page size, canonical category lookup, pagination and failure semantics remain authoritative. Unknown category handles are not promoted to products.
- The Figma stock dots and certification badges have been omitted because `ProductCardModel` contains no independently qualified stock, certification, grade or processing authority. These must be added later via approved, separately governed provider contracts.
- Local Next-optimised assets and Medusa-published thumbnails replace Unsplash prototype URLs; no runtime dependency on image hosts in Figma Make is created.

## Required qualification

- Run `pnpm format:check`, type-check, lint, unit tests and `pnpm build`.
- Enforce existing total emitted CSS <=64 KiB and client JS <=800 KiB; no exemptions or softened limits.
- Verify homepage and catalogue at 320px, 390px, 768px, 1024px and 1440px. Review the **expected** visual baseline differences for the strip, featured catalogue and catalogue page independently before approving new snapshots.
- Verify no horizontal clipping; keyboard accessible product links, search, filter disclosure, pagination and empty states; mobile and desktop category-query preservation.
- Existing E2E must still exercise published/empty/provider-failure modes, isolation between market-scoped assortment and synthetic dev fixtures, and no fake checkout/commitment.
- Do not merge before owner signs off on design and all final-head required checks pass.

## Next

After this combined PR receives visual approval, proceed with `Market Footprint` as the next isolated landing-page component.
