# Figma Make component migration — 01: Homepage hero

Status: **Proposed, pending CI and visual review**  
Source: [ZuriBeans Figma Make prototype](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype) (`src/components/Hero.tsx`).

## Scope

This first component migration changes only the public homepage hero and its editorial content.
The existing Next.js App Router page, server-rendered market context, shared header, footer,
buyer/supplier routes, Medusa, IAM, Control Plane, CMS and purchasing gates are unchanged.

## Adaptation

- Translated the prototype's dark, immersive, bottom-weighted hero layout into Tailwind v4
  and ZuriBeans tokens; no Vite app, client-side routing or dependencies were imported.
- Preserved the repository's project-owned, priority-loaded optimised WebP hero image instead
  of depending on the prototype's remote Unsplash image.
- Adopted the prototype's editorial headline and two genuine destinations:
  **View Catalogue** → `/products`; **How We Trade** → `/trade`.
- Kept the server-derived `MarketContextBadge` and neutral evidence statement in the domain content.
- Added the prototype's desktop three-metric rail with `12+` export markets,
  `98%` documentation rate, and `7` years trading as **development prototype content**.
  The values, large type, gold rules and supporting copy are displayed without intrusive
  verification banners so developers can review the approved design; the rail is hidden
  on mobile in keeping with the Figma composition.
  Prototype certification claims such as `ISO 22000` and `EUDR ready` were not adopted.
- **Staging/production release gate:** Before publishing metrics as business facts,
  obtain a responsible owner, verified source, numerator/denominator (where applicable),
  reporting period, legal entity and market scope. Replace or remove unsupported claims
  before staging/production promotion. Development visual acceptance does not imply
  business verification.
- Kept the server component, semantic H1, keyboard-accessible link controls, reduced-motion
  defaults and existing page metadata.

## Review and acceptance

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`.
2. Run `pnpm exec playwright test tests/e2e/home-hero.figma.spec.ts tests/e2e/landing-page.accessibility.spec.ts`
   with supported development dependencies/services.
3. Review screenshots at 320, 390, 768, 1024 and 1440 CSS pixels.
4. Verify the desktop rail matches the Figma three-value hierarchy and that no
   intrusive development disclaimer appears in the rendered hero.
5. The existing landing-page visual snapshots **will legitimately differ** from the
   earlier hero; do not automatically accept or overwrite them. Owner-approved
   comparison and baseline refresh are required before merge.
6. Confirm the original hero image composition is suitable for mobile (20% focus)
   and desktop (30% focus), and check LCP/CLS against existing budgets.
7. Do not treat development CI or visual acceptance as release approval for commercial
   metrics, copy or origin representation. Apply the separate staging/production evidence gate.

## Next isolated components

Trust Evidence Strip → Featured Commodities → Market Footprint → Trade Process →
Quality Evidence → Insights → Trade Pathways. Maintain separate reviewable commits/PRs
as appropriate, and preserve domain/integration authority in every migration.
