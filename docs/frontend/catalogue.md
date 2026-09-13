# Product catalogue

Status: Gate 6 implemented  
Reviewed: 2026-09-13

The public catalogue is a Server Component backed by the ZuriBeans Medusa adapter. It supports
server-side search, category filtering by human-readable handle, market-aware requests, validated
pagination, loading, empty and upstream-failure states.

## Boundaries

- UI components receive normalized `ProductCardModel`, `ProductCategoryModel` and
  `ProductListModel` values; Medusa response types do not cross the adapter boundary.
- The request-scoped market resolver supplies the country pricing context. Leaf components contain
  no Uganda or South Africa branching.
- Public results never infer buyer eligibility, contract price or inventory. On upstream failure the
  page fails closed instead of substituting sensitive or stale commercial data.
- Category handles are resolved to Medusa category IDs on the server.

## Media

Local images and the Medusa backend origin are allowed by default. Additional exact HTTP(S) origins
must be declared through `PRODUCT_MEDIA_ORIGINS`. The same parsed allowlist configures Next.js image
optimization, Content Security Policy and adapter normalization; untrusted product media is replaced
by the stable ZuriBeans fallback.

## Rendering and performance

- Search and filter state lives in the URL and is processed by the server; no filtering client bundle
  was added.
- Results use 12-item pages and responsive image `sizes`.
- Only the homepage hero is priority-loaded. Catalogue images remain lazy by default.
