# Frontend performance

Status: Gate 15 implemented  
Reviewed: 2026-09-13

Performance is an architectural gate for the public estate and authenticated portals. The browser
does not integrate Baobab services, sensitive data is never placed in a shared cache, and Server
Components remain the default.

## Implemented controls

- Catalogue categories and products are requested concurrently on the common unfiltered route. A
  category-filtered request remains sequential because the authoritative category identifier must
  first be resolved from its public handle.
- Product detail metadata and page rendering share one request-scoped React cache entry, avoiding a
  duplicate Medusa lookup without sharing results across visitors.
- The 1,536 × 1,024 origin image is 188,036 bytes in WebP form. Its versioned URL receives a
  one-year immutable browser cache; changing the bytes requires a new versioned filename.
- Next Image negotiates AVIF or WebP, reserves image geometry, and receives explicit responsive
  `sizes`. Priority is limited to genuine route-level LCP candidates.
- Public catalogue and PDP routes stay explicitly dynamic because market context changes their
  authoritative Medusa request. Account, cart, checkout, order and supplier data remain private and
  are never placed in a shared frontend cache.
- Client boundaries remain isolated to browser interaction: the global market switcher/mobile menu,
  the owned dialog primitive, and exact supplier navigation state. No page is marked client-side.

## Enforced build budgets

`pnpm perf:budget` measures production output after `next build`, and CI fails when any ceiling is
exceeded.

| Asset                         |  CI ceiling | Rationale                                                                                         |
| ----------------------------- | ----------: | ------------------------------------------------------------------------------------------------- |
| All emitted client JavaScript | 700 KiB raw | Conservative whole-build guard, stricter route-level measurement follows in deployment monitoring |
| Largest JavaScript chunk      | 250 KiB raw | Prevents a single unexpectedly large dependency or client boundary                                |
| All emitted CSS               |  64 KiB raw | Protects the small token-and-utility design system                                                |
| Largest public raster image   |     250 KiB | Prevents unoptimized source media from entering the estate                                        |

The Gate 15 production build measured 594.8 KiB total emitted JavaScript, 223.6 KiB for the largest
JavaScript chunk, 24.4 KiB total CSS and 183.6 KiB for the largest public image. These raw whole-build
figures provide the baseline for regression review; they are not presented as per-route transfer size.

These are regression ceilings, not targets to consume. Core Web Vitals production targets remain
LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile. Lighthouse targets remain 90+
Performance and 95+ Accessibility, Best Practices and SEO. Field measurement requires the deployed
observability endpoint planned for production readiness; local synthetic scores are not presented as
field results.

## Review checklist

For each frontend change, review client-boundary growth, duplicated requests, cache audience,
market variation, image dimensions and `sizes`, LCP priority, layout stability, emitted assets and
upstream waterfalls. A green budget does not permit commercially sensitive caching or unnecessary
hydration.
