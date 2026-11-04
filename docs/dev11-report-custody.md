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
