# ZuriBeans trade-house identity under Baobab Experience System

**Scope:** Extension of ZuriBeans PR #147. **Status:** Consumer implementation,
not group-wide brand replacement or protected production acceptance.

**Visual authority:** Approved [ZuriBeans Figma Make prototype](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype),
especially the geometric mark and public shell in `src/components/Nav.tsx`,
the editorial `Hero.tsx` and the design-system continuation brief.
Accepted Shared ADR-SHARED-040 governs semantic presentation, behaviour and
accessibility, **not** identical subsidiary imagery or brand colours.

## Family resemblance versus estate distinction

| Shared Baobab foundation                                                    | ZuriBeans-owned identity                                                    |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Namespaced `--bx-*` semantic roles, keyboard/focus, feedback and disclosure | Deep ink green, warm canvas and sand, restrained clay/gold                  |
| Versioned BXS tokens, UI, geo and chart display models                      | Geometric trade-house mark and own wordmark from Figma Make                 |
| WCAG 2.2 AA, responsive, reduced motion and performance gates               | Source Serif 4 editorial; Source Sans 3 functional                          |
| Evidence/state and provenance presentation, not domain authority            | Commodity specification, sourcing, procurement and cross-border trade       |
| Consumer lifecycle and approved provider contracts                          | Separate buyer and supplier navigation, identity and qualification journeys |

ZuriBeans is **a B2B agricultural commodity trading business**. Nabhold Group
Africa is its holding parent, not its public operating persona. Thamani is a
separate specialist logistics enterprise. An export document or carrier
reference does not make ZuriBeans a parcel-booking or shipping provider.

## Implemented

- Root HTML has `data-bx-theme="zuribeans"`, so all Shared BXS primitives
  inherit the same estate-wide semantic palette. Remove duplicate theme
  attributes in nested Help and synthetic-only development sections.
  The estate-owned Tailwind palette remains unchanged.
- Replace the old coffee-only bean image with the exact 28-by-28 geometric
  square/path/dot shape already present in approved Figma Make Nav. Keep
  the owned static SVG path and accessible home-link name. The displayed
  brand spelling is consistently `ZuriBeans`.
- `TradeHouseSignature` is an SSR-compatible presentation component with
  distinct public, buyer and supplier language. It conveys no legal
  registration, vendor onboarding, price, inventory or transaction grant.
- Apply the signature to public CorporateHero, supplier editorial hero,
  the buyer portal and buyer/supplier sign-in. The separate authenticated
  provider and redirect boundaries remain unchanged.
- Replace public About/Trade platform-internals copy with accurate
  commercial language: procurement, specifications, supplier evidence
  and provider-owned transport services. Provide clear separate buyer
  and supplier next steps on About.
- Retain the approved homepage hero, image, multi-column catalogue, map,
  CTA architecture, content authority and Figma typography. Do not
  rebase these UI elements on Nabhold's holding-company gold/black palette.

## Acceptance

Keep the previously verified all-six-package lockfile and package versions.
Retain format, lint, typecheck, unit, Storybook, production build, E2E,
Lighthouse, axe/WCAG and approved visual regression baselines across all five
viewports (320/390/768/1024/1440). Assert one correctly scoped BXS
theme at the document root; verify public/buyer/supplier language and
separate route destinations. Do not raise CSS 64 KiB, total emitted
JavaScript 800 KiB or other frontend budgets to accommodate the identity
layer. Browser presentation is not connected CP/IAM/Trade acceptance.
