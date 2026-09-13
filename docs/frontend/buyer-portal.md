# Buyer portal

Status: Gate 10 boundary implemented  
Reviewed: 2026-09-13

The authenticated buyer shell remains intentionally restricted. ZuriBeans can identify a Medusa
customer, but Baobab Trade has not published the buyer-organisation, membership, role, approval,
contract-pricing, order-projection or document-projection contracts required for a production buyer
workspace.

## Implemented boundary

- `/account` remains the only buyer navigation route exposed to an authenticated customer.
- `src/lib/buyer/capabilities.ts` is the presentation-layer boundary for future server-resolved
  capability snapshots.
- Navigation fails closed when a snapshot is absent, false or incomplete.
- The account dashboard names unavailable workspace sections without linking to nonexistent routes.
- No customer metadata, browser state or login existence is interpreted as trading approval.

The capability snapshot must eventually come from a trusted ZuriBeans application service that
combines approved IAM identity/context with Baobab Trade commercial authorization. Leaf components
must receive normalized capabilities and must not call Baobab engines directly.

## Contract dependencies

| Buyer section        | Required authority                                              |
| -------------------- | --------------------------------------------------------------- |
| Company              | Baobab Trade buyer-organisation profile contract                |
| Team                 | Trade membership/role contract plus IAM entitlement mapping     |
| Catalogue            | Market eligibility, account pricing and availability projection |
| Orders               | Buyer-scoped Trade order projection                             |
| Documents            | Buyer-scoped Trade/ERP document projection                      |
| Approval authorities | Trade purchasing-approval contract; no route is exposed yet     |
| RFQs and quotations  | Trade RFQ/quotation contracts; deferred to Gate 12              |

## Activation rule

A route may be added to buyer navigation only when its server-side application service supplies an
explicit `true` capability from the authoritative contract. Unknown and missing values remain
unavailable. The current shell therefore passes `null` and exposes Overview only.
