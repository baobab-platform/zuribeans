# ZuriBeans Figma Make — public sourcing and supplier acquisition convergence

**Scope:** public `/sourcing`, public `/sourcing/become-a-supplier`, and the public utility-bar buyer entry. This does **not** qualify the protected supplier application, supplier workspace or buyer dashboard.

**Reference:** [ZuriBeans Figma Make prototype](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype), `src/pages/PublicPage.tsx` (`SourcingContent` and `SupplierAcquisitionContent`) and `src/components/Nav.tsx`.

## Authoritative visual layout

Both public routes use the same Make editorial hero: full-width ink background, small breadcrumb and eyebrow, a large light Source Serif display headline, restrained orbital outline and explanatory copy. The two pages then diverge:

| Route | Make composition | Production mapping |
| --- | --- | --- |
| `/sourcing` | Two-column introduction; “Before you apply”; four numbered requirements; one prominent CTA | Responsive two-column text/numbered-list section, with “Review the application path” to `/sourcing/become-a-supplier` |
| `/sourcing/become-a-supplier` | Three joined numbered cards: Review, Apply, Qualification; lower contrasting CTA band | Three cards at desktop/tablet, vertical at mobile; supplier registration and sign-in choices |

Shared hero implementation: `src/components/marketing/supplier-editorial-hero.tsx`. The page headings, paragraphs and step labels come from the actual prototype rather than a generic supplier marketing template.

## Authentication and route safety

The Make prototype uses an illustrative direct CTA from its public acquisition page to `/supplier/apply`. In the real estate, `/supplier/apply` is a protected authenticated application route. **The production CTA must instead go to `/supplier/register`** and existing suppliers use `/supplier/login`, then the existing governed application workflow. Public acquisition content does not assert supplier approval, stock, certifications or eligibility.

The utility bar's unauthenticated buyer entry reads **Login/Register**, links to `/buyer/login` and is titled “Buyer login and registration”; the **Supplier Portal** link independently routes to `/supplier/login`. When a buyer session exists, the utility entry continues to read “Buyer account” and points to `/account`.

## Responsive and engineering acceptance

The established canonical widths remain **320, 390, 768 and 1440px**. New `tests/e2e/sourcing-figma-public.spec.ts` verifies both public pages' structure, links and horizontal-overflow safety, with screenshots at mobile and desktop. Existing supplier and header tests assert their new headings, CTA destinations and utility labels.

No CSS/JS or Lighthouse budget is raised; the existing homepage visual baselines and permitted deviation remain unchanged. Protected portal functionality and authenticated workflow visual acceptance are explicitly deferred to their owning workstreams.
