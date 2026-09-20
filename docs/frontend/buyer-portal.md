# Buyer portal

Status: Gate ZB-04 apply, approve, capabilities, Company, Team + invite; Gates 11–12 contract-blocked
Reviewed: 2026-09-20

## Implemented boundary

- `/account/apply` — PENDING org + membership + ACCOUNT_ADMIN.
- `/account/company` — read-only when capability `organisation`.
- `/account/team` — roster + invite (ACCOUNT_ADMIN) when capability `team`.
- Invite creates INVITED membership; accept/login linkage is not in this gate.
- Capability snapshot from Trade; catalogue/orders/documents remain false.
- Staff: list/detail/status on Trade admin B2B organisation routes.
