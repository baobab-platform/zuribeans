# Buyer portal

Status: Gate 10 boundary implemented; **Gate ZB-04 apply + status read wired to Trade**; Gates 11–12 contract-blocked
Reviewed: 2026-09-20

The authenticated buyer shell remains intentionally restricted for catalogue, orders and documents.
ZuriBeans can identify a Medusa customer and, after Gate ZB-04, can **apply** for a buyer organisation
and **read** organisation/membership status from Baobab Trade.

## Implemented boundary

- `/account` remains the primary buyer navigation route for an authenticated customer.
- `/account/apply` submits `POST /store/b2b/organisations/apply` on Trade (PENDING organisation +
  ACTIVE membership for the customer). One membership per customer in this increment.
- Status is loaded via `GET /store/b2b/organisations/me` and shown on `/account`.
- `src/lib/buyer/capabilities.ts` is the presentation-layer boundary for future server-resolved
  capability snapshots.
- Navigation fails closed when a snapshot is absent, false or incomplete.
- No customer metadata, browser state or login existence is interpreted as trading approval.
- Organisation `ACTIVE` still does not open Company/Team/Orders routes until a capability snapshot
  returns explicit `true` flags.

## Contract dependencies

| Buyer section        | Required authority                                              |
| -------------------- | --------------------------------------------------------------- |
| Apply / status       | Trade store B2B organisation apply + me (Gate ZB-04)            |
| Company              | Baobab Trade buyer-organisation profile contract                |
| Team                 | Trade membership/role contract plus IAM entitlement mapping     |
| Catalogue            | Market eligibility, account pricing and availability projection |
| Orders               | Buyer-scoped Trade order projection                             |
| Documents            | Buyer-scoped Trade/ERP document projection                      |
| Approval authorities | Trade purchasing-approval contract; no route is exposed yet     |
| RFQs and quotations  | Trade RFQ/quotation contracts; deferred to Gate 12              |

The Gate 11 and Gate 12 dependency audit is recorded in
[`docs/frontend/purchasing.md`](./purchasing.md).

## Activation rule

A route may be added to buyer navigation only when its server-side application service supplies an
explicit `true` capability from the authoritative contract. Unknown and missing values remain
unavailable. The current shell therefore passes `null` and exposes Overview only, even when the
organisation is `ACTIVE`.
