# Buyer portal

Status: Gate ZB-04 onboarding surface (apply through profile extensions)
Reviewed: 2026-09-20

## ADR constraints observed

- ADR-0005: session = Medusa customer identity only; never trading approval
- ADR-0017: org membership, roles, approved delivery sites; address ≠ organisation identity
- zuribeans-tax / ADR-0018: tax registrations PENDING until staff VERIFIED; membership alone grants no treatment
- Estate holds no duplicate Trade domain tables — all org/profile data via Trade store APIs

## Implemented

- Apply, staff approve, capabilities, Company, Team, invite/accept
- Tax registrations (buyer declare; staff verify via Trade admin)
- Delivery sites (ACCOUNT_ADMIN)
- Catalogue / orders / documents still closed (Gates 11–12)
