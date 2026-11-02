# Figma Make component migration — 02: Homepage trust strip

Status: **Proposed in PR #145 — owner visual review and CI required**  
Source: [ZuriBeans Figma Make prototype](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype), `src/components/TrustStrip.tsx`.

## Scope and design translation

This PR updates the immediate post-hero ribbon and, by owner request, the featured commodities section and `/products` catalogue page. The approved hero, market context, supplier workflows and unrelated homepage sections remain unchanged.

- Forest-green assurance band, gold uppercase 12px labels, 11px secondary text, 3px spacing,
  18px vertical / 28px horizontal item padding, 140px minimum width and fine dividers.
- Keyboard-focusable horizontal overflow for narrow viewports without clipping.
- Contrast-conscious secondary descriptions rather than copying the prototype's low-opacity
  `rgba(247,242,233,0.42)`.

## Two deliberately separated data sources

**Normal public operation:** `HomePage` uses `getVisibleEvidence(TRUST_EVIDENCE)` to render only governed public evidence. It does not infer ISO accreditation, EUDR compliance, UTZ/RA certificates, trade-finance facilities, documentary readiness or full chain traceability.

**Explicit local synthetic preview:** when `NODE_ENV=development` and `ZB_DEV_DATA_MODE=synthetic`, `HomePage` switches to `DEMO_TRUST_EVIDENCE` to faithfully display the Figma Make's six assurance labels: **ISO 22000, EUDR Ready, UTZ / RA, C.O.D Capable, Full Documentation, Farm-to-Shipment**. Each secondary line explicitly states **Sample**. Every specimen is `status: "development"` and `productionVisible: false`; the production evidence filter removes all six. No fixture creates a real certificate, facility, finance product or commercial approval.

The same server-only preview gate applies to the product catalogue's illustrative certificates, supply statuses and commercial terms, documented in `figma-make-product-catalogue-convergence.md`.

## Acceptance

Run formatting, lint, typechecking, unit tests, real-browser stories and build, retaining the 64 KiB CSS budget and existing JS/Image budgets. Review responsive captures at 320, 390, 768, 1024 and 1440 widths. Existing full-page screenshots must be reviewed before updating; do not suppress the visual regression gate. Do not merge without owner visual approval.

Next independent migration: **Market Footprint**.
