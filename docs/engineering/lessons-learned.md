# ZuriBeans engineering lessons learned and regression prevention

Status: **Active engineering practice — proposed for owner acceptance**
Established: 2026-11-01
Scope: ZuriBeans digital estate (and candidate for adoption by Baobab Experience System consumers)
Source PRs: [#131](https://github.com/baobab-platform/zuribeans/pull/131), [#142](https://github.com/baobab-platform/zuribeans/pull/142), [#144](https://github.com/baobab-platform/zuribeans/pull/144)

## Purpose

Engineering completion means diagnosing the root cause, applying a minimal safe correction, proving that the correction works, **and retaining a regression guard and a searchable explanation**. A previously resolved failure must not be rediscovered from scratch in subsequent stacked UI PRs. Do not mistake a green parent SHA for acceptance of a new descendant SHA.

This register is operational guidance, not a replacement for Accepted ADRs or independent release approval. CI failures must never be suppressed by weakening thresholds, muting test cases, using global layout clipping, or mass-updating screenshots.

## Known incidents and reproducible resolutions

<!-- prettier-ignore -->
| ID | PR / evidence | Symptom and root cause | Corrective action | Guard / replay | Anti-pattern |
| --- | --- | --- | --- | --- | --- |
| ZB-LL-001 | [#131](https://github.com/baobab-platform/zuribeans/pull/131); [failed run](https://github.com/baobab-platform/zuribeans/actions/runs/41282274247); [diagnostic run](https://github.com/baobab-platform/zuribeans/actions/runs/41287966782); [passing run](https://github.com/baobab-platform/zuribeans/actions/runs/41288633446) | At 320/390/768 px, absolutely positioned screen-reader-only ordinal counters in `TrustEvidenceStrip` inflated document scroll width to 887 px, triggering 27 browser failures and distorted full-page screenshots. | Remove redundant absolute counters; native `ul/li` semantics already supply list structure. Preserve keyboard focus and intentional horizontal ribbon scrolling. | Re-run responsive E2E at 320/390/768/1024/1440 plus navigation, footer, and snapshots; verify document width is no greater than viewport without clipping legitimate ribbon overflow. | Do not apply global `overflow-x: hidden`, remove accessibility semantics, or relax viewport assertions. |
| ZB-LL-002 | [#131](https://github.com/baobab-platform/zuribeans/pull/131); [final passing run](https://github.com/baobab-platform/zuribeans/actions/runs/41288633446) | After fixing overflow, five visual baselines still represented the old design. A changed snapshot is not automatically a defect or an approval. | Inspect actual artifacts and proposed baselines at each viewport; pin and review changed PNGs; import only deliberately approved snapshots. Remove temporary elevated-permission import workflows. | Keep `pnpm test:e2e:visual` gating, with baseline updates confined to an independently reviewed source commit. | Never run blanket `--update-snapshots` and count it as evidence of correctness; never auto-commit updated pixels from the normal CI job. |
| ZB-LL-003 | [#131](https://github.com/baobab-platform/zuribeans/pull/131), [#142](https://github.com/baobab-platform/zuribeans/pull/142); [design convergence guide](figma-make-hero-convergence.md) | Figma source parity required component-level inspection, not approximating the palette. Prototype KPI figures (12+ markets, 98% documentation, seven years) were not verified operational facts. | Port geometry/typography/spacing against actual source; keep real navigation and market context. Treat KPI rail values as development-only design content until authoritative evidence and owner approval. | Visual review across five widths; staging/production claims gate covering source, reporting period, legal entity, market and numerator/denominator. | No invented certifications, evidence or performance claims presented as live business facts. No unnecessary hero redesign when correcting unrelated faults. |
| ZB-LL-004 | [#144](https://github.com/baobab-platform/zuribeans/pull/144); [passing run on prior head](https://github.com/baobab-platform/zuribeans/actions/runs/41291477628) | PDP and preview additions increased emitted CSS from 62.9 KiB to 64.8 KiB, beyond the unchanged 64.0 KiB budget. | Reuse established responsive classes and remove one-off arbitrary utilities while retaining intended layouts and focus behavior. Prior verified output: 63.9/64.0 KiB. | `pnpm build` followed by `pnpm perf:budget`; monitor emitted CSS, total client JS, largest chunk and images. Budget currently recorded in PR: CSS 64 KiB, total client JS 800 KiB, largest JS chunk 250 KiB; source of truth remains the executable budget configuration. | Do not raise the budget, disable the gate, or hide additional CSS in a new bundle simply to secure green CI. |
| ZB-LL-005 | [#144](https://github.com/baobab-platform/zuribeans/pull/144); [passing run on prior head](https://github.com/baobab-platform/zuribeans/actions/runs/41291477628) | Lighthouse throttling competed with another Playwright worker, making a noisy 87/97 performance result. | Run Lighthouse as a separate, isolated single-worker CI step *after* general browser E2E, preserving score thresholds. Prior clean result: homepage performance 96, Origins & Markets 98. | `.github/workflows/ci.yml` runs `pnpm test:e2e` then `pnpm test:e2e:lighthouse` sequentially; retain performance evidence artifacts. | Do not reduce the performance threshold (90) or interpret one contended lab score as a reproducible product regression without isolation. |
| ZB-LL-006 | [#131](https://github.com/baobab-platform/zuribeans/pull/131), [#142](https://github.com/baobab-platform/zuribeans/pull/142), [#144](https://github.com/baobab-platform/zuribeans/pull/144) | Stacked branches and later supplier/PDP extensions changed the exact source under qualification. A green check on a preceding head is not final-head evidence. | Restack/rebase deliberately; inspect the resulting diff, preserve each PR's independent qualification, and associate evidence with the final commit SHA. | Before merge, confirm required checks on current head, inspect browser evidence and owner-review state. Follow dependency order where applicable. | Never claim full PR acceptance using a successful older SHA or infer a child PR passed from its parent. |
| ZB-LL-007 | [#144](https://github.com/baobab-platform/zuribeans/pull/144); [supplier journey design](zb-dev-supplier-journey-v1.md) | Figma preview data and supplier UI could be mistaken for authoritative operational/provider state. Certification chooser has a three-slot canonical provider limit. | Explicit opt-in synthetic mode in local development only; refuse excess certificate selections rather than silently discarding them; preserve existing server-action authority and provider custody. | Maintain fixture enablement negatives, synthetic-route non-exposure and supplier serialization/E2E tests. | No fabricated approvals, certifications, download URLs, inventory availability, legal authority or commercial commitments. |

## Required diagnostic sequence for a failing PR

1. **Identify the failing final-head SHA and exact failing step** from the GitHub Actions job; verify whether the failure is current or already fixed. Separate static analysis, build/budget, browser behavior, visual snapshots, and environment noise.
2. **Search this register and the cited PRs first**, using the observed failure signature. Apply a known remedy only after reproducing and verifying the same root cause. Different symptoms may have different causes.
3. **Preserve governing UX and architecture**: particularly the approved homepage hero, canonical routes, accessibility, IAM/CP/Medusa authority, and the development-versus-production evidence boundary.
4. **Change the smallest responsible surface**, avoiding unreviewed layout rewrites and CI relaxations. Where appropriate, add a focused negative or browser regression test.
5. **Run the narrow test, then the full qualified chain**: formatting, lint, typecheck, unit/component, production build, E2E, isolated Lighthouse, accessibility, visual review, budget and architecture validation.
6. **Document cause, fix and verification** using exact PR/commit/run URLs and measured before/after results. Mark unverified claims as pending, not passed.
7. **Do not merge** until mandatory checks pass against the actual current head, visual evidence is reviewed and any explicit owner-review gate is satisfied.

## PR author / reviewer checklist

- [ ] Read this register and check for a matching historical failure before making changes.
- [ ] State the affected routes/components and assert approved visuals are preserved unless intentional change is reviewed.
- [ ] Check 320/390/768/1024/1440 px layouts, including document width, keyboard navigation and scrollable strips.
- [ ] Keep CSS/JS/image budgets unchanged unless an independently reviewed engineering decision changes them.
- [ ] Keep Lighthouse isolated and thresholds intact; distinguish environmental variance from real regression.
- [ ] Inspect screenshot diffs; never approve a blanket baseline refresh.
- [ ] Preserve production/provider authority and ensure synthetic fixtures are excluded from live paths.
- [ ] Link CI and artifacts for the **current** SHA rather than a previous passing ancestor.
- [ ] Add or update a lesson whenever a novel failure, recurring failure, or repeatable fix is found.

## How to add a lesson

Use a stable ID `ZB-LL-NNN`; record **date; relevant PR(s)/SHA; observed failure and precise conditions; root cause with evidence; resolution; regression test or check; prohibited workaround; responsible component/owner; verification status and current run URL**. Separate *proposed hypothesis* from *verified resolution*. Cross-reference the lesson in the PR description or linked incident. If the same failure appears in another estate, nominate it for the Baobab shared experience engineering practice; do not silently declare it platform-wide Accepted.

## Current implementation and verification notes

- The responsive, snapshot, budget and isolated Lighthouse controls described above already exist in the ZuriBeans test/workflow paths; this document consolidates evidence rather than asserting that new guards were written by this documentation change.
- #131 and #142 historic statements must not be treated as proof that #144's newest head passed. The supplier-extension head requires its own checks and owner review.
- Documentation-only changes still create a new SHA and must pass required branch checks before merge.
