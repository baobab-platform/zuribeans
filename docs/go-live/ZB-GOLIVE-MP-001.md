# ZuriBeans Go-Live Masterplan v2.0

## Independent, governed, multi-market B2B cross-border trade

**ID:** ZB-GOLIVE-MP-001  
**Version:** 2.0  
**Status:** Accepted — programme governance baseline, 21 October 2026; publication subject to this PR passing repository acceptance  
**Owner:** ZuriBeans business sponsor and digital-estate delivery owner  
**Supersedes:** [Original unversioned plan](../adr/ZuriBeans%20Go-Live%20Implementation%20Plan%20%E2%80%94%20Multi-Market%20B2B%20Cross-Border%20Trading.md), retained as historical requirements and gate inventory  
**Governing:** [Shared EA v2.3](https://github.com/baobab-platform/shared/blob/main/docs/architecture/EA-implementation-plan-v2.3-2026-10-20.md), Accepted Shared ADRs and contracts, including the retained [EA v2.2 L4 scenario ID matrix](https://github.com/baobab-platform/shared/blob/main/docs/architecture/ea-v2.2-integration-acceptance-matrix.md); [Nabhold Go-Live v2.0](https://github.com/baobab-platform/nabhold/blob/main/docs/go-live/NAB-GOLIVE-MP-001.md) for corporate relationships only.

> Acceptance of this **programme** is neither evidence of incorporation nor market permission, a production capability grant, certified customs/tax/PSP activity, a Gate D/E pass, or a release GO. External facts and provider evidence remain independent.

## 1. Decision and commercial purpose

ZuriBeans is an independent B2B trading Organisation serving separately authorised markets, initially Uganda and South Africa. Each market may source, buy, warehouse, sell, import, export and fulfil only when actual operating-legal-actor mandates, product/category eligibility, inventory ownership, corridor requirements and capability grants permit that activity. Never hard-code Uganda as exporter and South Africa as importer. An authorised market can fulfil multiple roles. Products include coffee and vanilla; candidate alcohol and controlled product examples in the historical plan do **not** create permission to handle those goods.

The programme proves complete commercial and financial consequences: supplier → sourcing/procurement → approved quality/lot/stock → eligible offer → buyer RFQ/quotation → order → title/stock allocation → dispatch/export/import/transport/delivery → invoice/collection → ERP books/reconciliation/audit. Domestic transactions, external cross-border trade and inter-branch/intercompany trade are different transaction classes. The latter must distinguish **same** vs **different** legal entities and require accountant-approved pricing, title, tax, FX, due-to/from and elimination policies. Design for N markets and corridors; activate only independently qualified ones.

Corporate ownership does not grant Principal access, data sharing, seller entitlement or operational rights. Nabhold R0–R3 completion is **not** a global blocker for ZuriBeans R0–R3. Group oversight needs effective-dated relationship evidence and CP-approved per-subsidiary grants. Independence survives group entry/exit.

## 2. Normative authority and identity

Shared is authority for canonical identifiers/contracts/capabilities/events, not frontend-local equivalents. Control Plane (CP) owns Organisation, Tenant, legal and corporate relationship projections, market/context, mandates, products/subscriptions, entitlement/grant/binding, engine routing, provisioning and readiness. IAM owns authenticated human/workload identity, federation, token issuer, audience/scope, revocation, assurance. Trade owns commercial transaction orchestration and native seller commitments. ERP/iDempiere owns native enterprise financial/inventory/posting facts and consequences, not money execution. Payments owns authorised PSP movement/settlement outcomes; Subscriptions owns subscription/metering/billing semantics. CMS/Payload owns editorial content, publication/locale; ZuriBeans owns presentation. TMS owns physical transport execution; Trade Docs owns document issuer/evidence lifecycle, Regulations sources/evaluations, Pulse provenance-backed research only. Infrastructure owns deployment, secrets, runtime/network and disaster recovery.

**Organisation-first:** governed ClientApplication v2 → independently approved PRIMARY Organisation → Organisation-bound TenantOnboardingRequest v2 (requester and independent authoriser Principals, desired-state digest, no applicant tenant ID) → RegisterProgressiveTenantV2 → estate/product/capability intent → separate qualifications. ZuriBeans' Organisation and Tenant can persist before a separate incorporated LegalEntity exists. Each ZA/UG LegalEntity is attached only on independently verified evidence with historic actor attribution preserved. Incorporation is not presumed by the roadmap. Nabhold may act on behalf of ZuriBeans only with independently current lawful actor mandate; no fabricated controller relationship or proxy commercial activity. Govern seller of record, buyer of record, VAT/tax registration, regulated goods, bank/merchant beneficiary, exporter/importer of record and delegated signatory separately.

No public browser value may determine Tenant, legal actor, provider, market entitlement or privilege. Signed, time-bounded server-derived CP PlatformContext and exact IAM audience/scope, negative cross-tenant/cross-market/expired/revoked tests are mandatory at API **and consequential native execution points** (including Medusa checkout/admin/workflows/background replays and iDempiere posting before COMMIT).

## 3. Capability status and release governance

Historical capability names are **business demand candidates** until accepted in Shared. Do not synthesize registry keys or call proposed keys from production. Each item in [capability census](capability-demand-census.md) records C (canonical), P (proposed), I (source implemented), Q (protected staging and provider certified), A (active for the exact tenant/market/legal actor) **independently**. Source merged, mock success or CP declaration does not imply Q/A. For every protected action resolve current versioned contract, actual provider instance, release/health, entitlement/subscription, CapabilityGrant, binding, IAM audience/scope, CP context, legal actor/mandate and valid approval at execution time; fail closed.

Shared EA Gates A–E apply separately to architecture/contract, developer unfreeze, controlled Organisation onboarding, capability-specific protected staging, and production authorisation. Preserve the v2.2 L4 ID registry as normative; never mint local L4 IDs. Current source/green CI does not certify protected service, real legal status or money/customs operations.

## 4. Releases — independent outcomes

| Release                        | Minimum accepted business outcome                                                                                                                                                                                                                           | Not inferred                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **R0 Public Presence**         | Approved market-aware public website, buyer/supplier information and qualified CMS publication/withdrawal; accessibility, SEO, performance, brand and operations; no false live trade claims                                                                | R1 order or legal seller permission          |
| **R1 Domestic B2B Foundation** | Approved buyer/supplier identity/KYB, legally authorised seller in **one explicitly named qualified market**, product eligibility, procurement/inventory ownership, commercial RFQ/quotation/order, ERP consequences, required settlements and domestic tax | Both markets or cross-border                 |
| **R2 Cross-Border Corridor**   | Specific directional product-class lane, verified exporter/importer actors, qualified transport/customs/docs/tax/FX/payment/ERP reconciliation, source and independently accepted provider evidence                                                         | Any other corridor, alcohol or product class |
| **R3 Multi-market Expansion**  | Additional independently authorised markets/lane directions, approved branch/intercompany flows, advanced warehousing and provenance-backed intelligence/reporting                                                                                          | Parent-level universal portfolio access      |

Feature flags **withhold** unqualified capabilities; they never create market/legal authority. R0 may proceed separately. R1 is evaluated market by market; R2 lane, direction, product class, provider and effective date; R3 adds no automatic group grants. Partial approval must be explicit.

## 5. Implementation programmes and mandatory gates

These new programme gates **organise**, not delete, original ZB-00..29; consult [crosswalk](migration-crosswalk.md) for preserved original obligations. Implement independent safe tracks in parallel, but fail closed wherever a real upstream authority or provider is absent.

| Gate   | Work and proof                                                                                                                                                                                                | Primary owners                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| ZB-G00 | Accepted programme, ADR/contract and original-gate crosswalk, live register, evidence policy, dependencies; no unresolved P0 semantic ambiguity silently resolved in code                                     | ZuriBeans, Shared                         |
| ZB-G01 | ZA/UG actual legal identities/mandates, independent documentary provenance, Organisation-first admission, corporate relationships, legal-actor/source separation                                              | CP, IAM, legal reviewers                  |
| ZB-G02 | Demand census, canonical version lock, seller/buyer/counterparty/product/market/corridor/event/finance ownership and compatibility; registry proposals go through owners                                      | Shared, CP, domain teams                  |
| ZB-G03 | Human Kratos/Keycloak federation where authorised, Hydra workloads, CP live grants/context, passkey/step-up for high risk, execution-point IAM/CP/PEP, revocation/SoD                                         | IAM, CP, Trade, ERP                       |
| ZB-G04 | Public, Buyer, Supplier and authorised staff estates, Figma IA alignment, BXS Shared Base UI/tokens package pins, WCAG 2.2 AA, mobile/keyboard/E2E/performance; CMS canonical content and bootstrap migration | ZuriBeans, CMS, Shared                    |
| ZB-G05 | Buyer and supplier independent applications, KYB/qualification, staff review, canonical references, documents/custody/retention, approval/non-self-approval                                                   | ZuriBeans, CP, IAM, ERP                   |
| ZB-G06 | Canonical product, origin, vanilla/coffee lots, classification/HS/UOM, market assortments, price and tax provenance, customer-specific visibility, bans/recalls                                               | Trade, ERP, Regulations                   |
| ZB-G07 | RFQ/quote, negotiated terms, maker/checker commitments, procurement/PO/receipt/three-way-match, native Trade seller authority, replay/reversal                                                                | Trade, ERP                                |
| ZB-G08 | Owner/title/in-transit trace, availability, durable allocations, batches/quality, ERP-native AD_Client/AD_Org mapping, posting veto, balance/tie-out/reconciliation, legal-entity/intercompany correctness    | ERP, Trade, CP                            |
| ZB-G09 | Effective-dated lane rules and Incoterms, transport quotes/bookings/events/POD in qualified TMS, Trade Docs issuer state, independent customs, import/export/holds, insurance and traceability                | TMS, Trade Docs, Regulations, Trade       |
| ZB-G10 | Invoicing/AR/AP/FX/credit, separate billing/payment/PSP bank and settlement outcomes, merchant eligibility and approvals, refunds/disputes, GL posting/reconciliation                                         | ERP, Payments, Subscriptions              |
| ZB-G11 | Real-component integration receipts, negative/replay/failure injection, scenario proof domestic/export/import/intercompany/partial damage/customs hold, no assumed certification                              | Infrastructure, all owners                |
| ZB-G12 | Supported Foundation/toolchains, threat model, SLO/alerts, signed digests/SBOM, secrets/KMS, backups and recovery, POPIA/cross-border retention, protected staging, rollback/runbooks                         | Infrastructure, Security                  |
| ZB-G13 | Per-release, tenant, market, actor, product/corridor and capability GO/NO-GO; external approvals, business UAT, operational signoff, CP production activation and post-release observation                    | Business, Legal, Security, Operations, CP |

### G04 experience boundaries

Public: Home, Products, Origins & Markets, Sourcing, Trade, Quality/Traceability, Insights, About, Contact. Buyer: company onboarding, catalogue, RFQs, quotations, orders, shipments, documents, invoices, payments and account settings. Supplier: application/status, profile, products, certifications, documents and notices. Staff/finance/management functions are separate role-scoped logical experiences, not new authorities. Preserve the adopted Figma look when reconciling route names and navigation. RSC-first server BFF composition, streaming and data-boundary cache; public/bootstrap content does not grow frontend authoring. ADR-0014's file projection is temporary, fail-closed and must migrate via exact CMS delivery contract, canonicalContentId mapping, publication/locale parity, redirects, cache invalidation and provider certification. Browser tests include error/unknown/withheld states, mobile, keyboard/focus, screen-reader verification and performance budgets LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, Lighthouse targets ≥90/95/95/95 under documented profiles.

### G09 external authority distinction

TMS foundation and logistics provider operations are **dependencies**, not an invitation for the digital estate to fabricate shipment events. Do not equate a geographical map, estimated position, synthetic carrier receipt or simulator with real sourced transport data. Regulations suggests/evaluates human-governed effective-dated rules; Trade Docs and official authority determine actual document acceptance. Import/export and tax correctness require independent qualified origin/destination jurisdiction experts and providers. No unverified or prohibited product-class trade.

## 6. Priority, dependencies and parallel delivery

**P0-A programme/identity:** ZB-G00–03; current Shared v2.3/ADR-040/041, CP Organisation-first, legal actor and IAM; qualifying the seller for each market is an R1/R2 blocker but not a prohibition on R0 source improvements.

**P0-B safe frontend:** ZB-G04–05, BXS exact published package provenance, Base UI adoption, CMS provider seam, actual route/browser test acceptance and buyer/supplier validation. Can proceed without Nabhold INT-03 closure; reuse its proven IAM/CP/CMS patterns and independent receipts.

**P0-C commercial native authority:** ZB-G06–08, real Trade seller/operation authority; ERP closed native operation catalogue, correct mapping and PostgreSQL/native proof; no speculative financial execution. F1 finance source/candidates do not imply accepted Shared ADR-033 or provider qualification.

**P1-D corridors:** ZB-G09–10, trade lane and direction-specific licensing, Customs, TMS-FND/LOG-01..05, Trade Docs and Payments D2 provider certification; conditional until real partners/country evidence.

**P1-E integration/production:** ZB-G11–13, real connected integration/negative cases, signed AWS staging, independent reviews and separate production activation; apply runbooks.

**Deferred unless newly approved:** SCF lending, advanced commodity forecasting, blockchain, all-global-carrier coverage, active-active multi-region, robots, generic unbounded service mesh, speculative alcohol trade. Do not delay safe R0/R1 because unrelated future engine proposals are incomplete.

See [dependencies](cross-repo-dependencies.md) and [release acceptance](release-acceptance-matrix.md). Original ZB-00..29 remain traceable. Workstream readiness is updated in [register](register.md) with exact code/contract pins, reviewer, actual evidence and rollback.

## 7. Protected acceptance scenarios

Positive and negative proof for: market-isolated public articles and private catalogues; unauthorised buyer/supplier/staff attempts; wrong audience, tenant/Organisation/market/legal-actor, no/currently revoked grant, stale context or provider, forged origin/legal evidence; Medusa checkout/admin/event replay seller veto; iDempiere native posting guard and database commit/rollback; idempotent PO/receipt, lost callbacks, stock title/lot and multi-hop failures; price/FX/tax reconciliation; customs hold, transport late/partial/damage, cancelled/refunded payment and settlement/ERP reconciliation. Any partial saga uses explicit compensation, immutable audit and manual escalation. A simulated fixture cannot prove customs approval, carrier transport, bank movement, statutory compliance or native JDBC/OSGi posting.

**Mandatory reference scenarios:** UG coffee → ZA, ZA eligible product → UG (only when legally qualified), UG coffee → other authorised market, ZA domestic, net-30 credit, customs hold, partial shipment, damaged cargo, intercompany FX. Activate the named scenario only when its actors/product class/lane are qualified. Add failed seller authorisation and reversed payment/ERP posting cases.

## 8. Engineering policy and implementation evidence

Accepted Shared ADR-041 requires research against proven alternatives, lawful source/licence handling, re-engineering fit for Africa, maintainable comments for _nontrivial invariants_, narrow tested changes, threat models, idiomatic secure code and reproducible provenance. ADR-040 owns Shared Experience packages; pin exact published version/integrity before consumer CI. Match baobab-dev Foundation versions without unsafe blanket bumps: Node 24+ under approved app baseline, PostgreSQL 17 where qualified with explicit PG16 migration plan and retained rollback, native ERP Java/runtime evidence; no manual deletion of old database volumes. Codespaces package/GHCR authentication proof is separate from production workload credentials.

Each PR must declare: gates, accepted ADR/contract versions, exact source SHA, test and browser/native receipts, negative cases, external provider/legal approval where applicable, isolation and privacy impact, migration and rollback, current blocker and independent approver. A passed unit check never means Gate D/E.

Protected AWS staging requires independently provided account, trusted deploy roles, remote state, service endpoints, KMS, residency and recoverability. af-south-1 is default region, not all market data residency approval. No credentials or private documents in Git.

## 9. Security, operational and business go/no-go

Requirement: WCAG 2.2 AA, documented browser and real-network acceptance, immutable event/correlation, least privilege, SoD/maker-checker, data minimisation, POPIA/UG and cross-border transfer review, lawful provenance, controlled retention and data subject obligations, incident response, idempotency, SLO monitoring, RPO/RTO tested backups/restore, signed release, supply-chain scanning, vendor exits and post-release observation.

Operational runbooks: RB-00 deploy/rollback; 01 identity/session/workload compromise; 02 CP grants/onboarding/mandates; 03 CMS publish/withdraw/cache; 04 supplier/buyer KYB; 05 pricing/inventory/title; 06 Trade/ERP native veto/replay/reconciliation; 07 corridor/customs/Regulations/Trade Docs; 08 logistics delays/loss/POD; 09 PSP/settlement/credit/FX; 10 privacy/custody; 11 DR/secret rotation; 12 emergency market/product disablement.

A **GO** requires independently verified legal seller and activity permission, accepted relevant Shared contracts, actual provider/binding/readiness and active entitlement for the exact context, protected staging, external authority signoff where needed, reconciled durable outcomes, signed business/security/ops acceptance and rollback. Any mandatory **FAIL/UNKNOWN** is NO-GO for the affected release/capability/market/lane, not universally for unrelated safe releases.

## 10. Change control and completion

Major: legal/market/identity authority, commercial model, release policy, capability contract or active-state semantics. Minor: scoped approved programme/gate/product addition without changing invariants. Patch: dated evidence and task updates. Shared semantic changes land with owning Shared/domain ADR first. Every actual release decision has immutable evidence, current source pins, approvers, expiry/requalification and public-safe audit references.

**DONE** means the specifically named release and market/corridor runs with real authorised actors, provider trust and legal evidence, correctly bounded identity/context/entitlement, real financially reconciled outcomes, protected staging and recovery, independently approved sign-offs, CP-approved production activation and monitored operations. This programme document does not assert those facts already exist.
