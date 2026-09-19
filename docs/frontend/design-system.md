# ZuriBeans design system

Status: Gate 3 foundation  
Reviewed: 2026-09-13

## Direction

The system presents ZuriBeans as a disciplined African trade house: restrained, legible,
institutional, warm, and practical. It does not imitate a café, lifestyle shop, generic SaaS
dashboard, or imported starter theme.

## Dependency direction

`CSS tokens → Tailwind aliases → UI primitives → composite components → domain components → routes`

Primitives contain no market, product, buyer, supplier, pricing, inventory, or workflow logic.
Domain components receive normalized view models from application adapters.

## Tokens

Tokens live in `src/app/globals.css` and are exposed to Tailwind through
`tailwind.config.ts`. The foundation covers:

- brand and neutral colour;
- semantic success, warning, danger and information colour;
- surface and line hierarchy;
- control/panel radii;
- control, panel and overlay elevation;
- reading and page containers;
- focus colour;
- motion timing and reduced-motion behaviour;
- header/overlay layer intent;
- header tier heights (`--header-utility-height`, `--header-main-height`,
  `--header-sticky-height`) and the utility-tier background (`--color-ink-utility`) — see
  `docs/frontend/site-header.md`.

Raw brand colours and arbitrary shadows/radii must not proliferate in route components.

## Typography

- Display: current system serif stack for confident, editorial headings.
- Sans: current system sans stack for fast, predictable interface rendering.
- `.eyebrow`: shared compact section label.
- Body copy should normally use `text-muted`; avoid opacity stacking that produces uncertain
  contrast.
- Heading levels follow document structure, not desired font size.

External webfonts were deliberately not added. A future brand-font decision must include licensing,
subset, preload and Core Web Vitals assessment.

## Layout

- `.page-container`: responsive full estate container, capped at 80rem.
- `.reading-container`: long-form/content container, capped at 48rem.
- Shared panels use `rounded-panel`; controls use `rounded-control`.
- Mobile layouts use one column by default. Multi-column field and data layouts begin only where
  content remains usable, not at an arbitrary reference-template breakpoint.

## Foundation primitives

| Primitive                    | File                              | Notes                                                              |
| ---------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Button / ButtonLink          | `components/ui/button.tsx`        | Variant and size map; visible focus; disabled state.               |
| Input / Textarea / Select    | `components/ui/form-controls.tsx` | Shared control treatment with description/error helpers.           |
| Card                         | `components/ui/card.tsx`          | Surface/panel container only; no domain semantics.                 |
| Badge                        | `components/ui/badge.tsx`         | Neutral and semantic tones; callers map domain states.             |
| Alert                        | `components/ui/alert.tsx`         | Status/alert semantics selected by severity.                       |
| Skeleton                     | `components/ui/skeleton.tsx`      | Decorative loading geometry; respects reduced motion.              |
| Empty/Error/Restricted State | `components/ui/state-panel.tsx`   | Intentional route/domain states with optional action.              |
| Breadcrumbs                  | `components/ui/breadcrumbs.tsx`   | Semantic nav/list and current-page state.                          |
| Table                        | `components/ui/table.tsx`         | Server-friendly table primitives inside safe horizontal container. |
| Dialog                       | `components/ui/dialog.tsx`        | Native modal behaviour in an isolated client component.            |

Checkboxes and radios use native inputs styled at the form-composite level until a repeated design
need justifies dedicated wrappers. Combobox, tooltip, popover, menu, tabs, accordion, pagination,
toast, drawer and data-table behaviour will be added only when an implemented gate uses them. This
avoids shipping an unused component catalogue and dependencies merely to satisfy a starter's shape.

## Accessibility rules

- Interactive controls have a minimum practical touch height and visible `:focus-visible` state.
- Icons never replace an accessible name.
- Field descriptions/errors are connected through IDs by the consuming form.
- Errors are not represented by colour alone.
- Dialogs use the browser modal model; every implementation receives keyboard and focus QA.
- Tables require a caption (visible or screen-reader-only), scoped headers and a mobile alternative
  when horizontal review becomes impractical.
- Motion is optional and disabled under `prefers-reduced-motion`.

## Usage rules

1. Reuse a primitive before repeating a utility bundle.
2. Do not add `use client` to a primitive that requires no browser state or API.
3. Do not expose provider objects as primitive props.
4. Do not encode a domain status directly in `Badge`; map it in the relevant domain component.
5. Do not use `Alert` as a substitute for inline form errors.
6. Do not nest interactive elements.
7. Extend tokens before introducing a new raw brand colour, radius or shadow.

## Verification

The foundation is covered by type-checking, linting, the existing build, and a unit test for the
dependency-free class combiner. High-value interactive primitives receive component and browser
tests when introduced into an actual journey; unused demo components are not mounted in production.
