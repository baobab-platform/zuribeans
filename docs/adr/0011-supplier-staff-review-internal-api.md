# ADR 0011: Supplier staff review via interim internal API

## Status

Accepted

## Context

Gate ZB-05 requires staff to move supplier applications through the lifecycle already
defined in ADR-0006 and `src/lib/supplier/lifecycle.ts` (`submitted` → `under_review` →
… → `approved` / `rejected` / `active`), and to mark capabilities and certifications as
`verified` or `rejected` (declared ≠ verified).

ADR-0009 introduced an interim `SUPPLIER_ADMIN_API_KEY` solely for canonical-organisation
linkage, and forbade adopting that key on other routes without a new ADR.

There is still no Zuribeans staff identity (no Medusa admin user, no Keycloak workload for
estate ops). Trade ADR-0023 (Proposed) places long-term supplier onboarding in Trade; Shared
`supplier-onboarding/v1` system-of-record and Accepted ADR-0006 keep **pre-approval intake**
with the **hosting estate**. This gate therefore extends estate staff operations, not Trade
`b2b` tables.

## Decision

- Reuse `SUPPLIER_ADMIN_API_KEY` + `isAuthorizedInternalRequest` for these estate-owned
  admin routes only:
  - `GET /api/admin/suppliers` — list applications
  - `GET /api/admin/suppliers/{id}` — detail with capabilities, certifications, status events
  - `POST /api/admin/suppliers/{id}/status` — lifecycle transition with reason and actor
  - `POST /api/admin/suppliers/{id}/capabilities/{capabilityId}/verification`
  - `POST /api/admin/suppliers/{id}/certifications/{certificationId}/verification`
- All transitions MUST call `assertSupplierStatusTransition` (registration ≠ approval).
- Rejection MAY carry a Shared `rejectionReasonCode` (wire vocabulary from
  `contracts/supplier-onboarding/v1/domain.schema.json`); the code is stored in the status
  event reason text, not a parallel status enum.
- Capability/cert verification sets `verification_status` to `verified` or `rejected` with
  `verified_by` / `verified_at`; never invents product approval or ERP vendor readiness.
- Explicit non-goals (unchanged from ADR-0006): ERP Business Partner creation, bank-detail
  authority, document blobs, Medusa supplier models, message broker publishing.

## Consequences

- Staff can complete the review path the lifecycle already tested without a UI identity system.
- The interim key remains temporary; a future staff/IAM workload ADR supersedes auth only.
- Applicants still see status via `/supplier` (Medusa customer session); they cannot self-approve.
