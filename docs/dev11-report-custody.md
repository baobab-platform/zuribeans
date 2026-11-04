# DEV-11 original browser report custody

Each functional, accessibility, visual and Lighthouse invocation retains its
own original JSON, HTML and attachments. An unscoped diagnostics run writes
only into `playwright-report/unscoped` and `test-results/unscoped`; it must
never clean their parent directories and erase earlier gate originals.

`node scripts/dev11-report-custody.node.mjs` runs the actual pinned Playwright
CLI twice without browsers or services and compares original HTML, JSON and
attachment hashes. CI requires this source regression after package install.
It does not qualify browser journeys, IAM/CP, native Trade or a carrier.

This fixes the same reporter-parent hazard independently observed in Nabhold
artifact `13202032974`. The approved numerical budgets and screenshot
baselines are unchanged. Current-source estate-owned quality execution and
Infrastructure's independent artifact verifier remain mandatory.

## Explicit functional applicability

Original run `41804310127` retained 311 actual passing functional executions
and 174 deliberately skipped cases. Of these, 164 duplicate canonical-only
cases across non-owning browser profiles; ten are explicitly local synthetic
preview cases whose routes must remain absent in a production build.
The functional configuration now schedules `@canonical-browser` cases only
in `chromium-desktop`, and `@local-fixture` cases only outside CI. The source
assertions and their defensive runtime guards remain intact, including all
five-browser production preview-absence tests. No formerly failing case is
filtered and no local synthetic fixture counts as connected evidence.

New browser execution must still prove the same 311 applicable cases without
skips, retries or failures. Existing independent accessibility, visual and
Lighthouse suites, budgets and baselines remain mandatory. The prior original
is rejected by the strict verifier and cannot qualify this amended source.
Scheduling uses Playwright's documented project `grepInvert` and test tags:
https://playwright.dev/docs/api/class-testproject#test-project-grep-invert
and https://playwright.dev/docs/test-annotations#tag-tests.

The discovery comparison also exposed that the original PR job tested
GitHub's temporary merge tree. This candidate incorporates accepted main
`d08643d5275dff8a25b60e0181dadec6c26ee840` and preserves all 311 originally
passing case identities across the five projects. CI now explicitly checks
out and verifies the PR head, retaining `reports/dev11-source-sha.txt` in
the original artifact. The central verifier requires that successful source
guard and readback; an API `run.head_sha` by itself is insufficient provenance.
