# B2B purchasing, RFQ and quotation dependencies

Status: Gates 11–12 **outstanding and blocked by upstream contracts**
Reviewed: 2026-09-27

## Decision

Do not mark Gate 11 or Gate 12 complete. Do not expose cart, bulk order, quick order, checkout,
order history, reorder, RFQ or quotation actions in the current frontend. The estate now consumes Trade buyer relationships and capability snapshots through a server-only
adapter. Those onboarding capabilities do not implement purchasing or RFQ/quotation journeys.

This is a blocked gate, not a decision to replace Medusa. `docs/architecture.md` remains
authoritative: Medusa-native products, customer groups, sales channels, price lists, carts and
orders must be used first when the required B2B authorization boundary is available.

## Current estate evidence

Buyer onboarding and invitation consumption are merged through PRs #77 and #91.
The estate has company/team routes and a Trade capability adapter, but no purchasing,
order-history, RFQ or quotation routes. Navigation must require an implemented route as well
as an explicit capability grant.

Shared, Control Plane and IAM have ongoing implementation. Historical provider snapshots from
September 14 are not evidence of their current state. Before implementation, audit merged
provider contracts and open PR dependencies, then pin the accepted revisions. Provider delivery
and deployed acceptance evidence are separate from estate consumption.

## Gate 11 activation dependencies

| Journey                   | Required production dependency                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Cart and bulk order       | Approved buyer organisation, market eligibility, account entitlement and private pricing context      |
| Quick order validation    | Product/variant identifier, minimum order, availability, market eligibility and buyer price contract  |
| Checkout                  | Approved purchasing authority, delivery/trade-term inputs and authoritative order submission contract |
| Order history and reorder | Buyer-scoped order projection with stable product/variant references and authorization semantics      |

Cart, checkout and account data must remain dynamic, private and excluded from shared caches. The
browser must not evaluate eligibility or purchasing authority.

## Gate 12 activation dependencies

| Journey                     | Required production dependency                                                    |
| --------------------------- | --------------------------------------------------------------------------------- |
| RFQ creation and submission | Baobab Trade RFQ command/query contract and canonical status model                |
| Quotation review            | Buyer-scoped quotation projection, immutable version history and expiry semantics |
| Quote acceptance/rejection  | Trade commands, idempotency requirements and authoritative authorization result   |
| Quote-to-order conversion   | Trade-owned conversion command and resulting order reference                      |

No placeholder route, local persistence, fabricated status or disabled production-looking action is
added. When the contracts are published, implementation starts in a server-only application service
and adapter; UI components receive normalized view models and explicit capability results.

## Required upstream deliverable

Trade must publish one authenticated, server-enforced application boundary that resolves the active
buyer organisation and returns operation-specific decisions. At minimum it must cover catalogue and
price visibility, line eligibility, MOQ/order multiple, availability, purchasing authority, approval
outcome, cart ownership, checkout commitment and buyer-scoped orders. RFQ/quotation work additionally
requires canonical statuses, version/expiry semantics, idempotent commands and quote-to-order
conversion. ZuriBeans will consume that boundary server-side; it will not reconstruct these decisions
from JWT claims, customer metadata or browser-provided organisation identifiers.
