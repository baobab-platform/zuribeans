# ZuriBeans go-live critical-path implementation plan

Status: Execution baseline  
Reviewed: 2026-09-27  
Authority: ZuriBeans Go-Live Implementation Plan, accepted repository ADRs, and current cross-repository contracts

## Objective

Move ZuriBeans from a production-shaped public estate to a governed, production-qualified B2B
trading estate without moving Trade, ERP, IAM, Control Plane, CMS, Payments, Regulations, or
infrastructure authority into the frontend.

## Governing rules

- A merged implementation is not a passed programme gate until its production dependency and
  retained evidence exist.
- Authentication never implies buyer approval or purchasing authority.
- The browser never reconstructs tenant, legal-entity, market, pricing, credit, tax, inventory, or
  trading eligibility decisions.
- Cross-repository work merges provider contracts and services before consumers expose a journey.
- Each release candidate is one immutable SHA set across all participating repositories.
- Use `Masterplan ZB-nn`, `Frontend Gate nn`, or `Legacy Trade Gate nn`; never use an unqualified
  gate number.

## Execution sequence

| Wave | Scope                                                               | Primary repositories                                                                | Exit evidence                                                                                                                                      |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Reconcile open PRs, ADR status, contract locks, and gate vocabulary | all affected repos                                                                  | One dependency ledger; no ambiguous gate names; every open PR assigned a merge order                                                               |
| 1    | Finish buyer onboarding and secure invitations                      | `shared`, `baobab-cp`, `baobab-trade`, `baobab-erp`, `baobab-iam`, `zuribeans`      | Application → review → KYB → ERP commercial decision → activation → membership/invitation tests pass                                               |
| 2    | Finish supplier onboarding and ERP handoff                          | `shared`, `baobab-cp`, `baobab-erp`, `zuribeans`                                    | Application → information request/resubmit → verification → canonical linkage → ERP projection passes                                              |
| 3    | Publish buyer purchasing, RFQ, quotation, and transaction APIs      | `shared`, `baobab-trade`, `baobab-cp`, `zuribeans`                                  | Server-enforced capability results and idempotent RFQ/quotation/order APIs; Frontend Gates 11–12 enabled                                           |
| 4    | Reconcile IAM provider migration                                    | `baobab-iam`, `shared`, `baobab-cp`, `baobab-trade`, `baobab-erp`, `zuribeans`      | Provider-neutral BFF contract; Ory migration/cutover tests; revocation enforced in deployed composition                                            |
| 5    | Activate ZuriBeans UG/ZA ERP                                        | `baobab-erp`, `baobab-cp`, `baobab-trade`, `shared`                                 | Real iDempiere instances pass sell-side, buy-side, inventory, FX, reconciliation and isolation golden paths                                        |
| 6    | Add production providers                                            | `baobab-payments`, `baobab-regulations`, `baobab-cms`, `baobab-trade`, `baobab-erp` | Tax/customs, logistics, payments, documents and CMS content use approved provider contracts and real test environments                             |
| 7    | Build staging and production infrastructure                         | `infrastructure` plus service repos                                                 | DNS/TLS, gateway, secrets, databases, messaging, object storage, telemetry, backups, immutable promotion and rollback operate in staging           |
| 8    | Qualify the release                                                 | all affected repos                                                                  | Nine business simulations, adversarial suite, restore tests, load tests, accessibility review and operational drills pass on one candidate SHA set |
| 9    | Certify and activate                                                | `baobab-cp`, `infrastructure`, all providers/consumers                              | P13 REQUEST → VALIDATE → PLAN → APPLY → PROVISION → RECONCILE → READINESS → READY → ACTIVE, with no manual data override                           |

## Immediate merge train

Status on 2026-09-27: items 1–5 completed through ZB-04 PR #91 and ZB-05 PR #90. The
provider-revision lock and release assessment remain living controls rather than one-off completion
claims. Insights PR #83 and its CMS-boundary correction PR #93 are also merged; Payload runtime
delivery remains contract-gated.


1. Complete the stacked `baobab-trade` ZB-04 PRs before merging the ZuriBeans buyer UI. The UI
   calls endpoints not present on Trade `main`.
2. Merge the Trade stack from its `main`-based root through its certification tip, preserving
   branch dependencies and rerunning CI at each promoted base.
3. Merge ZuriBeans buyer PR #75 after current-main reconciliation and quality checks.
4. Merge ZuriBeans secure-invitation PR #77 only after #75 and the corresponding Trade invitation
   lifecycle are merged.
5. Merge ZuriBeans supplier PR #76 independently after verifying Shared supplier contracts and ERP
   projection semantics.
6. Update `contracts.lock.yaml` and the stale purchasing/readiness assessments only after provider
   commits are final; contract locks must cite the merged provider SHAs, not feature-branch SHAs.
7. Rerun the release assessment against the merged SHA and keep full B2B trading at NO-GO until
   purchasing, RFQ/quotation, observability, infrastructure, and deployed evidence are complete.

## Required checks per merge

- formatting, lint, type-check and unit/integration suites;
- production build and deployable-image build;
- repository-contract and Foundation gates;
- dependency, secret, SAST and container scans applicable to repository visibility;
- migration upgrade and rollback safety for schema changes;
- contract compatibility against exact locked provider revisions;
- tenant, organisation, actor, workload and estate isolation tests;
- no unresolved review, conflict, skipped required check, or stale-base state.

## Release decision points

| Decision                   | Minimum condition                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Public estate candidate    | Current frontend checks plus deployed catalogue, identity, supplier, accessibility, browser and performance evidence |
| Buyer-onboarding candidate | Waves 1–2 complete; no purchasing controls exposed                                                                   |
| Controlled B2B pilot       | Waves 3–7 complete in staging; explicit market, customer and transaction limits                                      |
| Production go-live         | Waves 0–9 complete and the final immutable candidate receives a recorded GO decision                                 |

## Stop conditions

Stop a merge train when an authority boundary is unclear, a provider contract is unmerged, a
consumer fabricates a capability decision, a migration lacks upgrade evidence, a required check is
red or skipped without an accepted policy reason, or a release claim relies only on repository-local
mocks where the gate requires a deployed integration.
