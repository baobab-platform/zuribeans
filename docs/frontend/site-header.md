# ZuriBeans site header

Status: Gate 4 addendum — two-tier trade-desk header
Reviewed: 2026-09-19

Detailed reference for `src/components/layout/site-header.tsx` and the components it composes.
`docs/frontend/global-shell.md` covers the shell as a whole (footer, skip link, landmarks); this
document covers the header's own anatomy.

## Component tree

```text
SiteHeader                          Server Component
├── UtilityBar                      Server Component (tier 1)
│   └── MarketSwitcher              Client island (existing, unchanged contract)
├── BrandLockup                     Server Component
├── DesktopNavigation                Server Component (tier 2, ≥ xl)
│   └── NavDisclosure × 4           Client island, one per dropdown group
├── ButtonLink ("Request a Quote")  Server Component
└── MobileNavigation                Client island (< xl)
    └── Dialog                      Client island (existing, unchanged contract)

HeaderScrollState                   Client island, rendered as SiteHeader's
                                     preceding sibling in src/app/layout.tsx
```

## Tokens

Defined in `src/app/globals.css`, consumed via Tailwind v4 arbitrary values
(`h-[var(--header-main-height)]`) rather than a JS theme namespace, since these are structural
heights rather than colors/radii/shadows already exposed through `@theme inline`:

| Token                     | Value   | Use                                                     |
| ------------------------- | ------- | ------------------------------------------------------- |
| `--header-utility-height` | 2rem    | Tier 1 height, initial                                  |
| `--header-main-height`    | 4.5rem  | Tier 2 height, initial                                  |
| `--header-sticky-height`  | 4rem    | Tier 2 height, scrolled                                 |
| `--color-ink-utility`     | #08241d | Tier 1 background, a darker derivative of `--color-ink` |

`--color-ink-utility` is also mapped into `@theme inline` as a color token (`bg-ink-utility`),
following the same pattern as every other brand color.

## Primary navigation model

Grouped instead of seven flat links, built from real content and market data rather than hardcoded
labels:

| Group       | Kind       | Source                                                                                             |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Commodities | Disclosure | `PUBLIC_PRODUCT_CLASSES` (`src/lib/content/public-estate.ts`) — the same data the homepage renders |
| Markets     | Disclosure | `marketContext.enabled` (`MarketContext`) — never a hardcoded Uganda/South Africa list             |
| Trade       | Disclosure | `/trade`, `/sourcing`                                                                              |
| About Us    | Link       | `/about`                                                                                           |
| Resources   | Disclosure | `/quality-traceability`, `/sourcing/become-a-supplier`, `/supplier`, `/help`                       |
| Contact     | Link       | `/contact`                                                                                         |

The Markets disclosure links to `/origins-markets?market=<key>` — the same pathname-preserving
query pattern `MarketSwitcher` already uses — rather than a per-market route, because
`/origins-markets/[market]` does not exist yet (IA doc: "Now after content model"). No route is
exposed here that does not already resolve.

`NavDisclosure` (`src/components/navigation/nav-disclosure.tsx`) is click/keyboard only, not a hover
mega-menu: a real `<button>` gets Enter/Space for free, `aria-expanded`/`aria-controls` reflect
state, the closed panel carries the `hidden` attribute (removing it from the tab order without a
manual focus trap), and Escape closes the panel and returns focus to its trigger. Hover is
deliberately not wired as an additional open path — the spec allows it as an enhancement, not a
requirement, and skipping it keeps the island smaller.

## Mobile navigation

`MobileNavigation` mirrors the desktop's six groups as flat links, each resolved to its single most
useful destination (a drawer lists journeys, it does not nest a disclosure inside a disclosure):
Commodities → `/products`, Markets → `/origins-markets`, Trade → `/trade`, About Us → `/about`,
Resources → `/quality-traceability`, Contact → `/contact`. Below that: market selection
(`MarketSwitcher`), the Request a Quote CTA, sign-in/account, Become a Supplier, Supplier Portal and
Help — matching the full action set the desktop utility bar and dropdowns expose.

## `/help`

`src/app/help/page.tsx` is a real public route (not a decorative link): it routes a buyer, supplier,
account or trade question to the existing channel that can answer it (trade desk contact, supplier
application, sign-in, or `/trade`). It is linked from the utility bar, the Resources disclosure, and
the mobile drawer, and is included in `sitemap.ts` and the accessibility route matrix in
`tests/e2e/accessibility.spec.ts`.

## Brand mark

`public/brand/zuribeans-mark.svg` is an original owned mark (a simple bean/seed silhouette with a
botanical seam), not a third-party or generic icon-pack asset. It is served with a plain `<img>`,
not `next/image`: Next Image does not optimize local SVG sources without `dangerouslyAllowSVG`,
which is a security-header decision (`next.config.ts`) out of this component's scope.

## Testing

`tests/e2e/site-header.spec.ts` covers the desktop initial state (brand, utility links, primary
nav, CTA href), disclosure open/Escape-close/focus-return, the anonymous/session account-link swap,
and the utility-bar scroll collapse. `tests/e2e/responsive.spec.ts` and
`tests/e2e/accessibility.spec.ts` were updated for the renamed mobile nav labels and the new `/help`
route respectively. Storybook stories for `BrandLockup`, `UtilityBar`, `DesktopNavigation`,
`NavDisclosure` and `MobileNavigation` cover visual states in isolation (see `.storybook/`).
