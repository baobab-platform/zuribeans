# Accessibility

Status: Gate 14 hardened
Reviewed: 2026-09-13
Target: WCAG 2.2 AA

## Implemented baseline

- A keyboard-visible skip link moves focus to the single global `main` landmark.
- Pages use semantic header, navigation, main, footer, section, form, fieldset, table and list
  elements before ARIA.
- Shared controls expose visible labels, focus indicators and disabled states.
- Native `dialog` supplies modal focus containment and Escape behavior for mobile navigation.
- Error alerts use live alert semantics and are associated with the affected authentication or
  supplier form.
- Motion is reduced when `prefers-reduced-motion` is active.
- Protected buyer and supplier content is excluded from indexing but remains semantically
  navigable after authentication.

## Gate 14 changes

- The light-surface clay text token was darkened from `#bb5b35` to `#9f4829`. Its contrast is 5.72:1
  on the canvas, 6.12:1 on white and 4.55:1 on the solid sand token, meeting normal-text contrast
  requirements for each light surface.
- Dark surfaces use the separate `#d37a57` clay-inverse token, which measures 5.23:1 on ink
  (`#172219`). Keeping the roles distinct prevents a light-surface fix from regressing dark sections.
- Primary, footer, breadcrumb and market-switch links gained larger vertical targets without adding
  client JavaScript.
- A narrow supplier-navigation client boundary observes App Router pathname changes, so Overview is
  current only on `/supplier` and never remains stale after navigating to the nested application.
- Playwright coverage now checks bypass navigation, one main landmark, one named level-one heading on
  every public top-level route, and accessible names on authentication controls.

## Verification approach

`pnpm lint`, component semantics and Playwright keyboard assertions provide automated regression
coverage. CI executes the core journeys in Chromium, Firefox and WebKit desktop plus Chromium and
WebKit mobile projects. Manual release review must still include a complete keyboard walkthrough,
zoom/reflow at 200% and 400%, and a screen-reader-oriented pass across public, buyer and supplier
journeys. Automated checks do not replace those release checks.
