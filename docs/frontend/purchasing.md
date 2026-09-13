# B2B purchasing, RFQ and quotation dependencies

Status: Gates 11–12 blocked by upstream contracts
Reviewed: 2026-09-13

## Decision

Do not implement cart, bulk order, quick order, checkout, order history, reorder, RFQ or quotation
routes in the current frontend. The buyer shell proves customer identity but has no authoritative
buyer-organisation approval or commercial capability snapshot. Exposing Medusa cart/order actions
at this point would make authentication appear equivalent to trading authorization.

This is a blocked gate, not a decision to replace Medusa. `docs/architecture.md` remains
authoritative: Medusa-native products, customer groups, sales channels, price lists, carts and
orders must be used first when the required B2B authorization boundary is available.

## Evidence

- `contracts.lock.yaml` pins Trade to its Medusa v2 Store API and records no published company,
  quotation or approval-flow contract.
- ADR-0005 defines the current session as customer identity only and explicitly prohibits treating
  it as an approved trading relationship.
- No ZuriBeans adapter currently resolves an approved buyer organisation, account pricing,
  purchasing authority, RFQ or quotation capability.
- No buyer-scoped order, shipment, invoice or document projection is published for this estate.

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
