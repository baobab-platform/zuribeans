# Frontend testing and browser matrix

Status: Gate 17 implemented  
Reviewed: 2026-09-13

The frontend test strategy combines domain-level unit tests with real browser journeys. CI uses the
Baobab frontend E2E image so browser binaries and system libraries remain governed by the shared
development environment rather than downloaded ad hoc during a pull request.

## Browser and device matrix

The core Playwright journeys run against the current engines represented by:

| Project            | Playwright device | Purpose                                             |
| ------------------ | ----------------- | --------------------------------------------------- |
| `chromium-desktop` | Desktop Chrome    | Primary desktop behavior and Chromium compatibility |
| `firefox-desktop`  | Desktop Firefox   | Gecko rendering and interaction compatibility       |
| `webkit-desktop`   | Desktop Safari    | WebKit desktop compatibility                        |
| `chromium-mobile`  | Pixel 7           | Touch/mobile Chromium behavior                      |
| `webkit-mobile`    | iPhone 15         | Touch/mobile WebKit behavior                        |

Responsive-specific assertions run once in Chromium at 390 × 844, 820 × 1180 and 1920 × 1080. The
general public, supplier, accessibility and SEO journeys still run across every project, so the
mobile device profiles exercise more than the dedicated width checks.

## Current coverage

- public visitor understands the proposition and enters the catalogue;
- public routes expose a single main landmark and named level-one heading;
- keyboard users can focus and activate the skip link;
- authentication fields expose accessible names;
- supplier visitor understands qualification and reaches the application entry point;
- canonical/social metadata, structured data, crawler policy and sitemap fundamentals;
- mobile menu destinations, tablet supplier CTA, desktop navigation and horizontal-overflow guards.

Supplier persistence tests use PostgreSQL when `SUPPLIER_DB_URL` is available. Buyer checkout,
orders, RFQ and quotation E2E journeys remain blocked until their authoritative Baobab Trade and
buyer-capability contracts exist; tests must not simulate those capabilities as production behavior.

## CI policy

CI forbids focused tests, retries a failed browser test once with a first-retry trace, and caps
browser workers to two for predictable resource use. A retry is diagnostic tolerance, not permission
to leave a known flaky assertion. Format, lint, type, unit, build, performance budget and browser
failures all block merge.
