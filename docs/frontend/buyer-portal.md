# Buyer portal

Status: Gate ZB-04 onboarding surface (application slice in progress)
Reviewed: 2026-09-20

## ADR constraints observed

- ADR-0005: session = Medusa customer identity only; never trading approval
- ADR-0017: org membership, roles, approved delivery sites; address ≠ organisation identity
- zuribeans-tax / ADR-0018: tax registrations PENDING until staff VERIFIED; membership alone grants no treatment
- ADR-BCP-016: Control Plane verifies the bounded canonical organisation link; it does not own the full buyer admission lifecycle
- Estate holds no duplicate Trade domain tables — all org/profile data via Trade store APIs

## Implemented in the open ZB-04 sequence

- Buyer application capture with server-authoritative tenant context and idempotency
- Application status displayed separately from organisation status
- Company, team roster, tax-registration, and delivery-site surfaces consume Trade APIs
- Invitation creation is fail-closed until secure email delivery exists; no bearer token is returned to or displayed by the browser
- Catalogue, orders, and documents remain closed (Gates 11–12)

## Not yet certified

- Staff review and immutable admission decision workflow
- Atomic organisation, initial membership, role, and outbox creation after approval
- Secure invitation delivery adapter
- ERP projection and end-to-end certification

No ZB-04 work is mergeable while required CI workflows cannot start because of Actions billing.

### Secure member invitations

Account admins invite a permitted buyer role through the Trade-owned members API. The estate
generates an idempotency key but never receives, renders, logs, or stores the bearer token.
Trade queues email delivery and returns only membership and delivery status. INVITED members
have nullable customer and Principal identifiers until acceptance; the one-time token expires
after 48 hours.
