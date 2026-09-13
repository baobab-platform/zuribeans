# Public estate SEO

Status: Gate 16 implemented  
Reviewed: 2026-09-13

SEO applies to the public corporate and product-discovery estate. Authentication, account and
supplier-application surfaces are not acquisition pages and must not be indexed.

## Implemented controls

- Every stable public route receives matching canonical and Open Graph URLs from one metadata
  builder. Catalogue searches, filters, market query parameters and pagination consolidate on
  `/products` rather than creating duplicate indexable URLs.
- The root metadata supplies organization-wide Open Graph and Twitter cards using the optimized,
  versioned origin image. Product detail metadata overrides these values with authoritative product
  content and media when available.
- Organization JSON-LD includes only established identity, initial markets and operating subject
  matter. It deliberately omits addresses, social profiles, telephone numbers, accreditations and
  other facts that have not been made authoritative in the repository.
- Breadcrumb components emit matching `BreadcrumbList` JSON-LD. Product detail routes emit Product
  JSON-LD from published Medusa fields, without invented offers, prices, ratings, identifiers or
  availability.
- `robots.txt` excludes account, supplier application, cart, checkout and API prefixes. Login and
  registration remain crawlable so their `noindex` metadata can be observed, but neither appears in
  the sitemap.
- The sitemap contains only stable public routes. Product URLs are not enumerated until the Baobab
  Trade/Medusa catalogue exposes a bounded, reliable sitemap projection and revalidation contract.

## Verification

The E2E suite checks canonical, Open Graph and Twitter tags, parses Organization JSON-LD, verifies
private crawler exclusions, and confirms sitemap inclusion/exclusion. Structured-data serialization
has a unit test that prevents script-breaking markup injection.

Production verification must use the deployed canonical origin through `NEXT_PUBLIC_SITE_URL` and
validate representative pages with search-engine rich-result tooling. A schema.org record is not a
promise that a search engine will grant a rich result.
