# Buyer portal

Status: Gate 10 boundary implemented; **Gate ZB-04 apply, status, approve, capabilities, Company, Team**; Gates 11–12 contract-blocked
Reviewed: 2026-09-20

## Implemented boundary

- `/account` — identity + organisation status from Trade.
- `/account/apply` — `POST /store/b2b/organisations/apply` (PENDING org + membership + ACCOUNT_ADMIN role).
- `/account/company` — read-only profile when capability `organisation` is true.
- `/account/team` — read-only roster when capability `team` is true (`GET /store/b2b/organisations/:id/members`).
- Capability snapshot from `GET /store/b2b/capabilities`:
  - `organisation` / `team` true only when membership ACTIVE **and** organisation ACTIVE
  - `catalogue` / `orders` / `documents` remain false until later gates
- Staff: `GET /admin/b2b/organisations?status=PENDING`, `POST /admin/b2b/organisations/:id/status`.
- Login alone never unlocks commercial data.

## Activation rule

Navigation items appear only when the snapshot flag is explicitly `true`. Missing or false stays closed.
