# DEV-07 supplier identity and ERP handoff

The estate owns sourcing intake. CP owns the canonical Organisation and human
Principal; ERP owns native Business Partner/vendor records. A supplier record
is never a Trade buyer Organisation or an ERP posting receipt.

The existing canonical-link API is an operator backfill under ADR-0009. It
records a reference; its interim internal key does not attest a CP Principal,
Organisation admission, mandate or procurement permission. The first link is
immutable through this API. Identical retries read the same record; a different
Organisation returns 409 and requires governed reconciliation. Pending or
projected ERP links cannot be rebound to another supplier.

The ERP handoff now claims PENDING under a supplier row lock. Exactly one
concurrent READY/FAILED request can claim it. The state change and its history
commit together. Readiness cannot reset an unresolved PENDING or completed
PROJECTED record to make it retryable. A public ERP identifier is stored only
after a matching active supplier receipt; existing ERP links are immutable.
The candidate receipt wrapper must explicitly match the requested canonical
supplier Organisation, configured tenant and engine instance. A standalone
BusinessPartner projection cannot prove that relationship.

| Observation                                                                              | Disposition                                                           |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Missing or invalid canonical deployment configuration                                    | No request; readiness unchanged.                                      |
| Invalid input or explicit 4xx request refusal                                            | FAILED after the claim; known refusal may be retried.                 |
| Timeout, transport failure, redirect or server error                                     | Keep PENDING; outcome unknown, reconcile with the owner before retry. |
| Malformed, oversized, foreign-legal-actor, customer-only, inactive or invalid-ID receipt | Keep PENDING; no projected identity accepted and no blind retry.      |
| Valid active supplier receipt for the configured legal actor/country                     | PROJECTED with Shared's bounded lowercase `erp_*` identifier.         |

Credential transport requires a complete deployment-owned canonical tenant,
legal actor and engine instance, verified HTTPS, no redirects, a bounded
deadline and bounded JSON. Provider error bodies and native identifiers are
not echoed to the operator. Country is a requested address fact, not authority
to infer an ERP company or engine placement.

## Open provider boundary

The legacy client calls `/business-partners/project`. ERP currently exposes no
such operation. ADR-ERP-021 is a proposed client-topology decision; it does not
define or approve this route or its candidate scope-bound receipt wrapper.
These corrections make the existing opt-in client
fail closed. Configuration and a mocked receipt do not qualify a supplier
provider, create a CP attestation, or prove an iDempiere effect.

Remaining engineering includes an owner-approved supplier projection contract
and adapter, current IAM/CP/canonical supplier authority, durable idempotency and
native unknown-outcome reconciliation, independent owner readback and actual
native JVM/database evidence. Existing PENDING, malformed legacy identifiers or
wrong links require that governed reconciliation; this change does not rewrite
their history. Original INT-05 and provider/protected/production acceptance
remain separate.
