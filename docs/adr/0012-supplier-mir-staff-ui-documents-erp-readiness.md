# ADR 0012: Supplier MIR resubmit, staff ops UI, document references, ERP readiness

## Status

Accepted

## Context

Gate ZB-05 residual work after ADR-0006 / ADR-0011:

1. Applicants must respond when status is `more_information_required` or `sample_required`.
2. Staff need an HTML surface, not only admin JSON routes.
3. Certification **documents** were deferred in ADR-0006 (no object-storage decision).
4. ERP Business Partner mapping was deferred in ADR-0006 (no adapter exists).

## Decision

### Applicant MIR / sample resubmit

- When status is `more_information_required` or `sample_required`, the authenticated Medusa
  customer may replace organisation profile, contacts, capabilities, and certifications and
  transition to `under_review` with actor `customer:…` (still uses `assertSupplierStatusTransition`).
- Applicants cannot self-approve or skip the lifecycle.

### Staff HTML UI

- `/ops/suppliers` is gated by the same interim `SUPPLIER_ADMIN_API_KEY` (ADR-0009/0011),
  presented as a server-set httpOnly cookie after a key form post — not a general staff identity.
- UI lists applications, shows detail, and posts status transitions via server actions that call
  the same repository functions as the admin API.

### Document blobs

- **Still no object storage.** Add `supplier_document_references` for **metadata only**
  (label, kind, external URI or offline note, optional content hash). No multipart upload path.
- Staff or applicant may record that evidence exists offline or at an external URI; estate is not
  document custody (Shared supplier-onboarding SoR).

### ERP projection

- Add `erp_projection_status` on `supplier_organisations`:
  `NOT_REQUESTED | READY | PENDING | FAILED | PROJECTED`.
- Staff may mark `READY` only when organisation status is `approved` or `active` — a readiness
  signal for a future ERP adapter, **not** Business Partner creation (ADR-0006).

## Consequences

- ZB-05 review loop is operable end-to-end without inventing storage or ERP coupling.
- Future ADRs may introduce object storage and baobab-erp adapters without schema rewrites of
  the readiness and document-reference seams.
