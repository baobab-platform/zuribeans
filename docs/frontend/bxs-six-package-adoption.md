# ZuriBeans — BXS-05 six-package consumer integration

**Status:** Implementation PR; not a production/protected acceptance receipt.
**Governing:** Accepted Shared ADR-SHARED-040 and BXS/BGX evidence register.
**Scope:** ZuriBeans estate only. Preserve the approved Figma Make public estate,
buyer/supplier journey separation, estate-owned colours and CMS/IAM/CP/Trade authority.

## Exact distributed BXS packages

All six published Shared packages are direct, immutably pinned dependencies.
Shared's 18 October 2026 publishing run 39073176845 and independent registry
SHA512/export verifier run 39073362603 cover their exact release versions.
This adoption uses a freshly resolved pnpm 11.24.0 frozen-lockfile graph;
no Git branch tarballs or unverified version ranges are used.

| Package | Pin | Consumer surface |
| --- | --- | --- |
| experience-tokens | 0.3.1 | Existing namespaced base and ZuriBeans theme CSS, not a new brand |
| experience-ui | 0.3.1 | Existing Help Disclosure; new SSR FeedbackPanel and StatusLabel |
| experience-geo-core | 0.3.1 | Coordinate and location-label validation for authorised display models |
| experience-charts | 0.1.0 | Null-preserving, source/timestamp-labelled accessible chart table model |
| experience-geo-maplibre | 0.2.0 | Server-import-safe `/model` validators; WebGL runtime NOT activated |
| experience-geo-deckgl | 0.1.0 | Exact-frame, bounded evidence projection and textual overlay alternative |

`experience-storybook` is an unpublished private Shared test workspace,
not a seventh distributable consumer package. ZuriBeans retains its existing
Storybook, real-browser and approval-golden acceptance infrastructure.

## Concrete integration

`src/lib/experience/bxs-consumer.ts` composes validated, allowlisted
read-only presentations from estate/BFF-supplied models. It never authorises
a buyer, discovers provider endpoints, infers legal market participation,
constructs a trade route, aggregates financial facts or creates live positions.
Denied projections must contain no data. Null chart values remain absent.

`/dev/experience/bxs` is available ONLY in local development with
`ZB_DEV_DATA_MODE=synthetic`; it is not indexed and returns 404 for
protected and production builds. It shows synthetic records, a keyboard/
screen-reader-accessible table and text geography/overlay evidence. It
intentionally never creates an interactive map or accesses third-party
resources. Ordinary public trading pages and the existing static editorial
map are unchanged.

## Subsequent gate for optional MapLibre / deck.gl rendering

Installing the Shared presentation models **does not** certify a WebGL map.
Activation requires a version-matched, application-owned MapLibre worker,
approved licensed HTTPS tile/style origins, reviewed CSP and cookie-free
egress, a caller-authorised BFF projection, explicit user activation, disposal
on context/grant changes, accessible list alternative, denied/unknown negative
cases, and real 390px/1440px browser/axe/keyboard/visual and device performance
evidence. deck.gl factory binding additionally needs pinned consumer-owned
runtime modules and teardown evidence. No provider, SLA, tracked vehicle,
route or ETA can be invented to satisfy this gate.

## Brand and performance invariants

- Keep ZuriBeans' forest/ink, clay/sand, typography and Figma Make identity.
  BXS CSS is namespaced; do not copy Nabhold gold or activate an unapproved
  Thamani logistics palette.
- Keep public TradeMap's static, evidence-labelled editorial treatment.
- Keep existing buyer/supplier roles and data planes under their owners.
- Retain 800 KiB total client JavaScript, 250 KiB largest client chunk,
  64 KiB CSS and 250 KiB public-image budgets; do not raise thresholds
  to admit optional WebGL code.
- Test frozen pnpm lock, formatting, lint, typecheck, unit, Storybook,
  E2E, Lighthouse, accessibility and visual snapshots before merge.
- No production map/provider or connected protected qualification is claimed.
