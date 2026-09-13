# ZuriBeans public homepage

Status: Gate 5 implemented  
Reviewed: 2026-09-13

The homepage now communicates the B2B offer, current market context, product classes, operating
markets, trade method, quality/traceability posture, and distinct buyer/supplier entry points.

## Content architecture

Product-class, market-summary and trade-step content is typed in
`src/lib/content/public-estate.ts`. Presentation components receive normalized content and contain no
Uganda/South Africa or coffee/vanilla branching logic. This local adapter can later be replaced by
Baobab CMS contracts without restructuring the page.

## Original hero asset

`public/images/zuribeans-origin-trade-hero-v1.webp` is an original project asset showing green coffee,
vanilla and export preparation in an East African setting. The optimized WebP is 1536×1024 at about
184 KiB. The page declares responsive sizes, stable fill geometry, priority only for this LCP image,
and descriptive alternative text.

## Performance

- The route remains a Server Component and adds no client JavaScript.
- No animation, carousel, video, canvas, external font, or third-party script was added.
- Content remains usable if the hero is unavailable.
- The existing request-scoped market layout still makes the route dynamic; Gate 0 records the ADR
  required before changing that behaviour safely.

## Claims and boundaries

- Buyer-specific pricing and terms are described but never exposed or calculated.
- Supplier submission is explicitly distinguished from qualification.
- No warehouse, certification, legal registration, buyer count or shipment-volume claim is
  invented.
