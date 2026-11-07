# BA-SEC-DEP-001 — Digital Estate Dependency and Security Maintenance Adoption

**Authority:** [Approved Baobab Dependency & Security Maintenance Policy v1.0](https://github.com/baobab-platform/shared/pull/429). Shared #429 is **still an unmerged engineering PR**: approval of the policy text is not acceptance of its strict reusable validator.  
**Record date:** 7 November 2026.  
**Status:** **SOURCE_COMMITTED** on the indicated estate PR; **CI_VERIFIED, SECURITY_ALERT_PATH_VERIFIED, CONSUMER_QUALIFIED and protected deployment evidence remain UNVERIFIED** until independently checked.  
**Owners:** Estate Engineering, Platform Engineering, Security. No self-certification.

## 1. Observed dependency surfaces

All three estates use a **pnpm 11** package-manager declaration, a root `package.json`/`pnpm-lock.yaml`, a real `Dockerfile` and GitHub Actions workflows. Their `.baobab/repository.yaml` declares Node, container, digital-estate and `node: pnpm`. None of the three has a root `docker-compose.yml`; do not invent a Compose ecosystem just to increase coverage.

| Dependabot ecosystem | Authoritative input | Qualifying action |
| --- | --- | --- |
| `github-actions` at `/` | `.github/workflows/*.yml` | Review SHA-pin/release provenance, including reusable Shared workflows |
| `npm` at `/` | `package.json` and root `pnpm-lock.yaml` | Verify pnpm resolver and private Baobab Experience package integrity |
| `docker` at `/` | root `Dockerfile` | Review base image provenance, applicable security advisories and digest-bound consumer |

**Policy controls:** Existing default branch is implicitly authoritative. Do not set `target-branch: main` (GitHub security updates still target the default branch, but the entry's settings would apply to version updates only). Optional groups are restricted to `applies-to: version-updates` and `update-types: [minor, patch]`; majors must be assessed independently. Routine updates run weekly with Monday SAST schedules and nonzero PR limits. Security patch triage follows advisory urgency, not the weekly schedule.

**Shared control consumption:** The repository's `.github/workflows/enforce-dependabot-config.yml` calls a previously accepted **immutable Shared baseline** and sets `required-ecosystems: "github-actions,npm,docker"`. It also executes a local source/negative suite (17 cases). The strict version of the validator introduced on Shared #429 is **not** assumed released and must not be used as an unaccepted branch SHA. Adopt it only following its independent acceptance, merge and immutable release.

## 2. Vulnerability surveillance and exceptions

The previously shared `pnpm-workspace.yaml` `auditConfig.ignoreGhsas` entry for `GHSA-vfj7-8cjw-p6xm` globally suppressed an advisory without an expiry. It is **removed**. Whether the upstream advisory is current/withdrawn, mitigated in context, or still exposed must be re-checked independently from a current authoritative advisory record and the actual lockfile. This source change is **not** a claim that the vulnerability disappeared.

`.github/workflows/security.yml` now runs a **daily full-lockfile audit** (including tooling/development dependencies): `pnpm audit --audit-level high`, rather than the earlier weekly production-only audit. Its audit job image is additionally pinned to the existing SHA256 digest `1b3165067912eacbca96b576efb67e0428850b1ff1a953aa9013127a01635371` observed in that estate's devcontainer/CI source; this is a source pin, not a new runtime receipt. The native audit fails on HIGH/CRITICAL findings or scanner failure. Foundation's scheduled security gates and independent CodeQL/Trivy coverage remain in force where supported; do not treat skipped or unavailable scanners as green.

Do not reinstate global `auditConfig.ignoreGhsas` or introduce an unconditional Dependabot ignore to greenwash CI. If an advisory has no available fix and the call path cannot be removed immediately, use the existing Foundation exception governance with a narrowly described advisory, exact dependency path, exposure/controllability analysis, independent approver, expiration date and remediation issue. Preserve **WAIVED** as a distinct state and re-review before expiry. A failing scan is **BLOCKED** until actually remedied or formally disposed; an exception is not equal to PASSED.

## 3. Verification and promotion gates

- Run `python3 -m unittest discover -s scripts/tests -p 'test_dependency_policy.py' -v` after installing the pinned PyYAML verifier; this is source conformance only, not an online Dependabot test.
- Verify the original GitHub Actions action-pinning gate, the accepted Shared Dependabot baseline and the Foundation native audit all execute at the **actual final commit**.
- Independently verify GitHub dependency graph, Dependabot Alerts, security updates and package-registry credentials. GitHub documents automatic Dependabot access to GitHub Packages using a package's **Manage Actions access** grants and its GitHub token (no invented PAT or registry secret is needed); verify the actual package ACLs and Dependabot job readback: https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-access-to-private-registries. A YAML file alone cannot prove any service is enabled.
- Run the estate's existing pnpm frozen install, lint, type checks, test, build, browser tests (Playwright), accessibility/visual regressions and performance budgets when packages change. Preserve business authorization **negative cases**, not just successful renderings.
- Confirm runtime image provenance, SBOM, exact published digest, deployed consumer version and the platform's protected environment approvals separately. No production or staging authority follows from merging a maintenance PR.
- Reconcile remaining HIGH/CRITICAL advisories and affected transitive owners with first-seen dates and the policy's incident-response deadlines. Scheduled daily inspection is **supplementary** to immediate incident triage.

## 4. Status discipline

Use explicit `SOURCE_COMMITTED`, `CI_VERIFIED`, `SECURITY_ALERT_PATH_VERIFIED`, `CONSUMER_QUALIFIED`, `WAIVED`, `BLOCKED`, `STAGING_VERIFIED` and `PRODUCTION_VERIFIED` where appropriate. File-level tests establish **source observations**, not live scanner results or proof of the configured release environment.

This is a policy-adoption/change-safety increment only. Existing business identity, IAM/CP authority, tenant isolation, provider access, financial commitments and cross-border verification remain under their respective canonical owner and accepted ADRs.
## 5. ZuriBeans-specific findings and unresolved risks

**PR:** [zuribeans #157](https://github.com/baobab-platform/zuribeans/pull/157).

- Previous Dependabot covered Actions, npm and Docker correctly but explicitly repeated `target-branch: main` on all three entries, interfering with ordinary security-update routing.
- Actions now use a **version-only minor/patch** group. npm stays deliberately **ungrouped**: the Medusa SDK/type dependencies, Next/React, Storybook and BXS packages can require coordinated testing; broad automatic grouping must not substitute for owner review.
- `Dockerfile` originally installed `corepack@latest` at build time. It now pins **Corepack 0.36.0** and verifies the installed version. A successful actual Node 24/Alpine build remains required; this source edit is not compatibility evidence.
- Current build/runtime images are `node:24.20.0-alpine3.24` **without immutable OCI digests**. Review upstream digest/signature and the separate open Node 26 Dependabot major PR #153 before considering a runtime change; no SHA/digest was invented in this audit.
- BXS packages come from private GitHub Packages; maintain ephemeral BuildKit secrets, frozen lockfile, published package receipts and negative auth boundaries. The 20+ Medusa/Storybook dependency matrix must remain owner-qualified.
- Preserve buyer vs supplier identity separation, scope/market refusal, genuine Medusa/CP/IAM buyer authority negatives, Postgres 17 test fixtures, and Playwright/Lighthouse/CSS/visual/a11y gates. Changing dependency versions without these tests is not enough.
- **Potential blocker:** The global `braces` advisory ignore is removed. Verify actual advisory status and lockfile path; no scanner or outcome is presumed green until the full native audit runs.

No buyer/supplier or trade commitment authorization was modified in this PR.
