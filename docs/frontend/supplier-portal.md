# Supplier portal

Status: Gate 13 implemented
Reviewed: 2026-09-13

The supplier experience preserves the ZuriBeans-owned supplier domain and the lifecycle defined in
ADR-0006. Medusa remains the identity provider only; it does not own supplier organisations,
capabilities, certifications or qualification state.

## Implemented journeys

- The public `/sourcing/become-a-supplier` route explains the application evidence and review
  boundary, using the shared public design system and optimized origin imagery.
- The protected `/supplier/apply` route collects organisation, contact, extensible product
  capability and certification declarations with responsive, accessible server-rendered controls.
- The protected `/supplier` route handles no-application, success and database-unavailable states
  intentionally.
- Submitted applications show organisation data, declared capabilities, certification declarations
  and a status presentation derived from the existing supplier state machine.
- All protected supplier routes are excluded from indexing.

## Trust and state rules

- Submission creates the existing `draft → submitted` event; no new transition or review authority
  is introduced.
- A declared capability or certification is never presented as verified.
- Status labels and explanations are centralized in `src/lib/supplier/presentation.ts` and cover
  every lifecycle state.
- Database failures return a safe service state and do not imply that an application was lost or
  resubmitted.
- The form remains a Server Component using the existing Server Action. No supplier data or token is
  moved into client-side state.

## Deferred dependencies

Secure supporting-document upload remains blocked on an approved object-storage service, malware
scanning, file policy, authorization and retention contract. The form explains this explicitly and
does not solicit files through email or local persistence.

Application editing/resume, staff review actions, applicant notifications, settlement-readiness
collection and supplier profile maintenance remain deferred until their persistence, authorization
and workflow contracts are designed. The current implementation does not fabricate these behaviors.
