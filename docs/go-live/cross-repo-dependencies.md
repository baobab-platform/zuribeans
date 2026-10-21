# ZuriBeans v2.0 — cross-repository dependency and drift audit

**Source:** Shared EA v2.3 accepted 2026-10-20 and its cross-repository audit; Nabhold v2.0; ZuriBeans ADR-0001..0014 and original plan. This is a bounded documentary/candidate-source audit, **not** current CI, external certification or a line-by-line 20-repo audit.

| Repository             | Required dependency / current risk                                                                  | Next acceptance                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `shared`               | EA v2.3, normative v2.2 L4 IDs, ADR-040/041; canonical contract and catalogue convergence, ENG/BXS  | Exact published packages, contracts and L4 receipts             |
| `baobab-cp`            | Organisation-first Tenant, market, independent legal-actor relationship and current grant/binding   | Governed application/mandates and protected actor-context       |
| `baobab-iam`           | Kratos/Hydra native and Keycloak federation; protected C4 path separate from synthetic INT-02/03    | Real audience, revocation, step-up and workload receipts        |
| `baobab-trade`         | Medusa native order/seller-authority at every consequence point; not just cart/API                  | Persisted guarded positive/denied/replay cases                  |
| `baobab-erp`           | iDempiere posting veto, supplier/stock title, journal and finance; PG17 operator migration separate | Native JVM+DB evidence and financial reconciliation             |
| `baobab-cms`           | Payload owns insights editorial lifecycle, provider partial and published/preview path              | Canonical content binding, cutover, withdrawal and cache parity |
| `baobab-tms`           | Foundation and accepted limited transport ADR; proposed provider semantics                          | Qualified real quote/booking/transport lifecycle                |
| `baobab-trade-docs`    | Real issuer/service/runtime and evidence gap                                                        | Versioned independent authoritative issuance                    |
| `baobab-regulations`   | Effective-dated policy/requirements partial                                                         | Jurisdiction sourced/expert approved evaluation                 |
| `baobab-payments`      | PSP/merchant D2, movement/settlement authority independent of ERP                                   | Bank/provider-qualified money movements and reversal            |
| `baobab-subscriptions` | Current ProductSubscription, metering and billing/tax/ERP event split                               | Qualified per-Tenant entitlement and reconciliation             |
| `baobab-pulse`         | Evidence/research only, no AI-generated statutory truth                                             | Provenance-backed optional R3 integration                       |
| `infrastructure`       | Synthetic INT-02/03 paths not equal ZuriBeans protected staging; AWS account/roles/KMS absent       | Distinct connected protected receipts and restore               |
| `baobab-dev`           | Approved Foundation, Nodes/PG compatibility, GHCR private package access                            | Version/digest lock, licence & compatibility proof              |
| `nabhold`              | Independent corporate relationship and authorised oversight, not required R1 corporate completion   | Independently verified relationship/grants only                 |
| `thamani`              | Autonomous sibling; B2B logistics pivot cannot determine ZuriBeans business model                   | No shared shadow source of truth                                |
| `baobab-scf`           | Proposed finance feasibility not active licensed banking                                            | Defer unless separate lawful sponsored decision                 |

Keep scope strictly B2B; ZuriBeans does not adopt Thamani's logistics-first estate nor its changing B2C/B2B release contract. Legal/corridor products are qualified in both countries independently. No assumption that corporate ownership grants seller or portfolio-reporting authority. Do not treat the list as exhaustive infrastructure/service discovery; update it after source-head and runtime audits.
