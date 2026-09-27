# ADR 0013: Store public ERP business_partner_id on estate after projection

## Status

Accepted

## Context

ADR-0006 deferred ERP Business Partner mapping. ADR-0012 added `erp_projection_status`
as a readiness flag only. baobab-erp ADR-ERP-021 now exposes
`POST /business-partners/project` and returns a Shared `erp/v1` public
`business_partner_id` (`erp_…`), never a native `C_BPartner_ID`.

After a successful project, ops support needs the public id on the estate record
without calling ERP again and without the estate becoming SoR for vendor master.

## Decision

1. Add nullable `supplier_organisations.erp_business_partner_id` (text).
2. On successful handoff (`PROJECTED`), persist only values matching `^erp_`
   (Shared public form). Reject/store-none if ERP returns a non-public id.
3. Estate remains **not** the Business Partner authority; the column is a
   **projection reference** for support and downstream correlation.
4. No bank, tax-depth, KYB workflow, document blobs, compliance screening, or
   broker publish is introduced here (still ADR-0006 / ADR-0023 deferred).

## Consequences

- Ops UI can show the public id after PROJECTED.
- Re-project may overwrite the stored public id if ERP returns a new one.
- Native iDempiere identifiers must never appear in this column or estate APIs.
