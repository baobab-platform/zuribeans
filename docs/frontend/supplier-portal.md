# Supplier portal

Status: Frontend Gate 13 application slice and Masterplan ZB-05 review/handoff implementation merged;
production certification outstanding
Reviewed: 2026-09-27

## Implemented on main

PR #90 integrates staff review and ERP handoff with the existing supplier application journey:

- Public supplier introduction and protected application/status pages.
- Information-request resubmission and lifecycle validation.
- Staff review, capability/certification verification and document-reference recording.
- Canonical organisation linkage and ERP readiness/projection state.
- ERP handoff consuming a public business-partner identifier rather than an internal ERP ID.
- Supplier event outbox persistence.

ADR-0006 governs estate-owned pre-approval intake. ADRs 0011–0013 govern staff review,
information requests, document references and ERP public identifiers. The estate does not
replace the canonical ERP Supplier domain. Declared evidence is not verified evidence.

## Remaining acceptance work

Secure document upload requires approved storage, malware scanning, file policy, authorization
and retention. Recording an external document reference does not implement file upload.

The staff surface uses an interim API-key session; workforce identity and authoritative actor
attribution require the accepted IAM boundary. Supplier outbox rows remain PENDING without a
dispatcher; broker delivery, retries, replay and reconciliation are not established by persistence.

Deployed ERP handoff, applicant notifications, supplier profile maintenance, restore and isolation
evidence remain release work. Confirm provider progress in the owning repositories before
describing any dependency as absent. Merged estate code alone does not pass Masterplan ZB-05.
