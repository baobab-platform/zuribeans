# Corporate and trade estate

Status: Gate 8 implemented  
Reviewed: 2026-09-13

The public estate now provides complete destinations for About, Origins & Markets, Sourcing, Trade,
Quality & Traceability and Contact. These routes share the ZuriBeans shell, design tokens,
breadcrumbs, responsive grid and a reusable server-rendered corporate hero.

## Content model

Stable market, trade-responsibility and quality-state content is typed in
`src/lib/content/corporate-estate.ts`. Market-specific presentation resolves through the central
market catalogue; reusable components do not branch on Uganda or South Africa.

The copy deliberately avoids claims about:

- owned warehouses, certifications or logistics assets;
- activated upstream market IDs that are not yet canonical;
- guaranteed availability, prices or delivery outcomes;
- automatic supplier qualification.

## Reusable media

The optimized origin/trade hero introduced in Gate 5 is reused with route-specific crops on pages
where it adds context. This avoids additional image requests and keeps the visual system coherent.
Routes without a meaningful image remain typographic and server-rendered.

## Platform boundary

The Trade and Quality routes explain responsibility without making the browser an integration layer.
The Contact route uses an explicit email boundary because no approved public-enquiry API contract
exists. The supplier call-to-action continues into the existing ZuriBeans-owned supplier lifecycle.

All new public routes are included in the sitemap. Authenticated routes remain excluded.
