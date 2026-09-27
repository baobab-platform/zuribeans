# Landing Page UI/UX and Testing Improvements

## Executive summary

Recent work has materially improved the ZuriBeans landing page as a conversion surface and as a maintainable frontend system. The global shell now follows the intended two-tier header concept, with a utility tier for market context and trust-oriented actions above the primary navigation tier. The homepage now gives buyers and suppliers distinct next steps, while the footer provides clearer navigation, subsidiary context, and clearly labelled legal-draft routes.

The work also moved the project from primarily example-based browser coverage toward repeatable accessibility and visual regression controls. The landing page now has automated axe coverage for the homepage and open mobile navigation, plus full-page screenshot baselines at five supported widths. A local canonical URL mismatch was fixed so SEO tests now use the same origin as the Playwright browser. The new checks are explicitly wired into the CI quality-gates workflow.

## Improvements delivered

| Area                            | Improvement                                                                                                                                                           | Result                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Global navigation               | Implemented and refined the two-tier utility and primary navigation model.                                                                                            | Market context, supplier conversion, help, sign-in, grouped navigation, and quote actions have clearer hierarchy.  |
| Keyboard usability              | Added skip-link behavior, visible focus recovery after header collapse, Escape handling, and regression coverage for keyboard-reachable utility links.                | Keyboard users can bypass navigation and recover access to links that are visually collapsed during scroll.        |
| Header iconography              | Refined utility-row icons for market context, supplier conversion, help, and account access.                                                                          | The icon system better matches the visual concept while retaining text labels and accessible names.                |
| Mobile responsiveness           | Added mobile-specific header behavior and compacted the homepage trade-pathway cards.                                                                                 | The 390px pathway cards reduced from approximately 521px to 434px without changing the larger desktop composition. |
| Homepage conversion             | Added distinct buyer and supplier trade pathways with separate copy, destinations, and approval-safe language.                                                        | Visitors can select the appropriate commercial conversation without ambiguous routing.                             |
| Footer information architecture | Grouped footer navigation, improved market-switcher touch targets, added subsidiary context, and added clearly labelled draft routes for privacy, terms, and cookies. | The footer now supports discovery, legal navigation, and responsive use more consistently.                         |
| Contrast and accessibility      | Corrected the light accent token, dark-surface eyebrow styling, and low-contrast map supporting text.                                                                 | The homepage now passes the configured axe scans without color-contrast violations.                                |
| SEO test reliability            | Configured the local Playwright web server to default `NEXT_PUBLIC_SITE_URL` to `http://127.0.0.1:3000`.                                                              | Canonical URL tests now compare metadata against the actual browser origin and pass locally.                       |
| Regression controls             | Added axe tests and five Chromium screenshot baselines at 320px, 390px, 768px, 1024px, and 1440px.                                                                    | Accessibility and visual layout regressions are now detectable in pull requests.                                   |
| CI integration                  | Added explicit `test:e2e:a11y` and `test:e2e:visual` commands and CI steps.                                                                                           | The new checks run as part of the repository quality gates rather than only on developer machines.                 |

## Current verification status

The implemented changes have been validated with the following results:

- The axe suite passed **10 tests** across Chromium, Firefox, and WebKit. It covers the homepage and the open mobile navigation state.
- The visual regression suite passed **5 tests** against the five requested viewport baselines.
- The SEO suite passed **6 tests** across Chromium desktop and mobile after the canonical-origin fix.
- Formatting, ESLint, TypeScript, and diff checks passed.
- The production build and frontend performance budget passed during the related landing-page work. The current budget remains within the repository thresholds for client JavaScript, CSS, and public images.

The visual suite intentionally uses Chromium desktop as the baseline browser. This keeps image comparisons deterministic while the axe suite remains cross-browser. The screenshot baselines are full-page captures, which allows regressions in the header, hero, content sections, trade map, conversion pathways, and footer to be detected together.

## Business and product impact

The landing page now communicates the commercial model with less ambiguity. Buyers receive a direct route to a quote conversation, while suppliers receive a separate qualification journey. The header and footer reinforce the same information architecture across the page, which reduces the risk that visitors interpret a portal, help route, or supplier application as interchangeable with a buyer enquiry.

The responsive improvements protect the mobile conversion path. The smallest supported viewport remains free of horizontal overflow, and the main navigation exposes essential journeys through the mobile menu. The visual baseline matrix provides an ongoing safeguard against changes that could weaken hierarchy, cause content collisions, or make conversion actions difficult to reach.

The accessibility improvements also reduce maintenance risk. Contrast roles are now encoded in reusable tokens and inverse section headings use the correct dark-surface treatment. Future component changes can be evaluated through the axe suite instead of relying only on manual inspection.

## Pull request scope

The accompanying pull request packages the new test suites, screenshot baselines, CI commands, Playwright origin fix, and the contrast corrections required for the axe suite to pass. It does not weaken existing SEO assertions or replace the broader E2E suite. Instead, it adds focused checks with explicit failure output and keeps the existing browser coverage intact.

## References

[1]: ../.github/workflows/ci.yml "Repository quality-gates workflow"
[2]: ../playwright.config.ts "Playwright browser and local web-server configuration"
[3]: ../tests/e2e/landing-page.accessibility.spec.ts "Landing-page axe accessibility suite"
[4]: ../tests/e2e/landing-page.visual.spec.ts "Landing-page visual regression suite"
[5]: ../tests/e2e/seo.spec.ts "SEO canonical and crawler-policy tests"
[6]: ../src/components/layout/site-header.tsx "Global site-header implementation"
[7]: ../src/components/layout/site-footer.tsx "Global site-footer implementation"
[8]: ../src/components/marketing/home/trade-pathways.tsx "Homepage buyer and supplier pathways"
[9]: ../src/app/globals.css "Global design tokens and accessibility styles"
