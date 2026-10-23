# Figma Make editorial estate migration

Design reference: https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype

## Guardrails

The Make project is a visual and interaction reference, **not** a replacement Next.js application. Keep server components, real routes, metadata, market-context resolution, shared Baobab packages, CMS and Trade clients, IAM session contracts, and buyer/supplier authorization intact. Do not port the prototype's client-side state router, invented commercial metrics, or mock commerce actions.

## Migration order

1. Landing-page hero: full-bleed image, gradient, serif editorial headline, existing market and evidence content — implemented on this branch.
2. Public shell: compare prototype light two-tier navigation and footer with responsive and accessibility states; implement shared shell variants rather than overwriting account/supplier chrome.
3. Landing modules: align featured products, trust evidence, market footprint, trade process and quality modules to prototype spacing and composition. Keep actual content sources and verified evidence statuses.
4. Insights: implement the prototype's landing-page insights composition using the existing canonical insights provider and /insights routes. No duplicated local article data.
5. Public pages: apply the same design tokens and components to product details, origins, sourcing, trade, quality, about and contact.
6. Buyer and supplier portals: visual parity after authorization-sensitive route and real API flow tests, without transplanting mock portal state.

## Required verification

- Compare at 375, 768, 1280 and 1440 CSS pixels against the Make design.
- Validate keyboard navigation, accessible names, WCAG AA contrast, reduced-motion behavior.
- Run lint, typecheck, unit/component tests, Next.js build and relevant E2E route smoke checks.
- Check LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 and Lighthouse targets >= 90/95/95/95.
- Maintain public launch target of 2027-01-02; a passing UI test is not evidence of live IAM/CP/CMS acceptance.
