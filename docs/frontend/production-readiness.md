# Frontend production readiness

Status: Gate 18 assessed — **not approved for full B2B trading launch**

Reviewed: 2026-09-14

Baseline: `main` after Gate 17 (`5ba2a302c0b93d0d19cfeb670ed2100316261a0f`)

## Release decision

The public estate, market-aware product discovery, customer identity boundary and supplier
application slice are production-shaped and protected by automated quality, security, performance,
accessibility and cross-browser gates. The complete B2B trading estate is not production-ready.
Authoritative buyer approval, purchasing, RFQ/quotation and operational telemetry contracts are not
available, and required manual/deployed-environment evidence has not been supplied.

This is a **No-Go for full B2B trading** and a **conditional release candidate for the public and
current supplier slice**. Infrastructure owners may evaluate that narrower slice only after every
deployment prerequisite below is evidenced. This document does not authorize deployment.

## Acceptance evidence

| Criterion                                        | State                            | Evidence or remaining condition                                                                                                      |
| ------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ADRs match the framework/environment baseline    | Pass                             | ADR-0007 supersedes ADR-0001; ADR-0008 supersedes ADR-0003                                                                           |
| Public and responsive navigation                 | Pass                             | Global shell plus five-project Playwright matrix                                                                                     |
| Uganda and South Africa context                  | Pass with constraint             | Resolver/unit coverage; candidate keys remain non-canonical until Control Plane publishes Market records                             |
| Catalogue and product detail                     | Pass with environment dependency | Server-only Medusa adapter, intentional service states, normalized presentation; controlled deployed Trade smoke test still required |
| Buyer authentication and protected route         | Pass with environment dependency | HttpOnly session adapter and protected layout; deployed identity smoke test still required                                           |
| Trading approval and B2B purchasing              | Blocked                          | No authoritative organisation/capability, cart eligibility, checkout, order or private-pricing contract                              |
| RFQ and quotations                               | Blocked                          | No published Trade command/query or status contract                                                                                  |
| Supplier application                             | Pass with constraints            | Postgres-backed tests and state machine; documents, resume/edit, staff review and notifications remain deferred                      |
| Private cache isolation                          | Pass by architecture/review      | Account and supplier paths are dynamic; no shared cache for identity or supplier state                                               |
| Intentional loading/empty/error/not-found states | Pass for implemented slice       | Route loading, domain states and root Next.js failure boundaries are present                                                         |
| Automated accessibility                          | Pass                             | Semantic/keyboard browser assertions; WCAG manual release review remains required                                                    |
| Performance regression controls                  | Pass                             | Build asset budgets enforced in CI                                                                                                   |
| Core Web Vitals/Lighthouse targets               | Not evidenced                    | Requires deployed synthetic runs and approved field telemetry                                                                        |
| Technical SEO                                    | Pass                             | Route metadata, canonicals, crawler controls, sitemap and structured-data tests                                                      |
| Browser compatibility                            | Pass in CI                       | Chromium, Firefox and WebKit desktop plus Chromium/WebKit mobile projects                                                            |
| Security checks                                  | Pass per PR                      | CodeQL, dependency audit, Foundation gates and deployable-image scan must also pass on the release SHA                               |
| Observability                                    | Blocked                          | Provider, processing/redaction policy, ingestion contract, alerts and runbooks are unapproved                                        |

## Deployment prerequisites

Before even the narrower public/supplier release, the release owner must record:

- immutable release SHA and successful CI, Security and Foundation runs for that SHA;
- production `NEXT_PUBLIC_SITE_URL`, exact Medusa URL/publishable key, enabled/default markets and
  supplier database secret supplied by `nabhold/infrastructure`;
- database migration execution, backup/restore evidence and rollback owner;
- TLS, DNS, CDN/image behavior, CSP and security-header verification at the public origin;
- live Trade catalogue/PDP, login/logout and protected-route smoke tests in both enabled markets;
- supplier submit/status smoke test against production-equivalent Postgres without retaining test PII;
- keyboard, screen-reader-oriented, 200%/400% reflow and reduced-motion review;
- deployed Chromium, Firefox and WebKit checks at representative mobile/tablet/desktop widths;
- Lighthouse evidence and 75th-percentile field Web Vitals once the approved telemetry contract exists;
- alert ownership and incident/rollback communications.

## Explicit release blockers

1. Publish and lock the Trade/Control Plane contracts for buyer organisation approval, market
   identity, entitlements, private pricing and purchasing.
2. Publish and lock RFQ/quotation and buyer-scoped transaction projection contracts before exposing
   those journeys.
3. Approve the observability provider, ingestion endpoint, data handling/redaction policy and
   operational ownership described in `docs/frontend/observability.md`.
4. Align the Next.js ESLint configuration in a dedicated dependency PR with the full verification
   matrix; Gate 18 aligns the React runtimes only because a render-level test demonstrated that the
   mixed installed versions fail immediately.
5. Complete and retain the deployment prerequisites above in the infrastructure/release system of
   record.

## Rollback and incident posture

Deployment and rollback are owned by `nabhold/infrastructure`. The application exposes
`/api/health` as process liveness only; it must not be treated as proof that Trade or the supplier
database is ready. A failed action must never be assumed successful: the global failure UI explicitly
requires confirmation from the relevant journey, and does not display error internals. Upstream
readiness aggregation requires an accepted infrastructure/service contract rather than synchronous
browser fan-out.
