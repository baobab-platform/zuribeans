# B2B purchasing, RFQ and quotation dependencies

Status: Gates 11–12 **outstanding and blocked by upstream contracts**
Reviewed: 2026-09-14

## Decision

Do not mark Gate 11 or Gate 12 complete. Do not expose cart, bulk order, quick order, checkout,
order history, reorder, RFQ or quotation actions in the current frontend. The buyer shell proves
customer identity but has no authoritative buyer-organisation approval or commercial capability
snapshot. Exposing Medusa cart/order actions at this point would make authentication appear
equivalent to trading authorization.

This is a blocked gate, not a decision to replace Medusa. `docs/architecture.md` remains
authoritative: Medusa-native products, customer groups, sales channels, price lists, carts and
orders must be used first when the required B2B authorization boundary is available.

## Current upstream evidence

- At Trade revision `44b8da95e5800b1ef904fa4b6883d984d602cf04`, the B2B module persists
  organisations, memberships, roles, approvals, commercial terms, contract prices and purchase
  constraints. Those are internal persistence and policy seams, not a frontend contract.
- At that same revision, Trade's only custom HTTP routes are `/health` and `/readiness`. There is no
  buyer-context, purchasing, order-history, RFQ or quotation command/query route and no ZuriBeans
  middleware that binds the internal B2B policy to Medusa Store cart/checkout operations.
- At Shared revision `798a16822f5ea46c826fafc689a64303d32ba3e4`, no buyer-organisation,
  purchasing, RFQ or quotation schema is published.
- Control Plane revision `597cac261d47a4de8d49efd5cf2a52f2f74456c2` provides Market and
  capability-resolution domains, but no locked ZuriBeans buyer capability projection consumed by
  Trade and this frontend.
- IAM ADR-0010 at revision `38f8d27f831ee50959db05a60430d9e5983079cb` remains Proposed and
  requires Trade to own buyer membership and purchasing authority.
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

## Required upstream deliverable

Trade must publish one authenticated, server-enforced application boundary that resolves the active
buyer organisation and returns operation-specific decisions. At minimum it must cover catalogue and
price visibility, line eligibility, MOQ/order multiple, availability, purchasing authority, approval
outcome, cart ownership, checkout commitment and buyer-scoped orders. RFQ/quotation work additionally
requires canonical statuses, version/expiry semantics, idempotent commands and quote-to-order
conversion. ZuriBeans will consume that boundary server-side; it will not reconstruct these decisions
from JWT claims, customer metadata or browser-provided organisation identifiers.
