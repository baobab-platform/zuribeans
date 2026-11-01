# ZB-DEV-SUPPLIER v1.0 — Make supplier UI port

**Branch / PR:** `feat/zb-dev-data-v1-synthetic-experience` / #144
**Prototype source:** `src/pages/SupplierApplication.tsx`, `src/pages/PortalEntry.tsx`, `src/App.tsx` of the user's extracted Figma Make prototype.
**Status:** development UI and fixture qualification; not a supplier or IAM governance acceptance.

## What the prototype actually contains

1. A two-column cream/forest-green `PortalEntry` for `/supplier` and `/supplier/resubmit`.
2. `SupplierApplication`: forest-green header; six-step desktop/mobile progress; business identity, contact, product list, origin/season, selectable certificate cards, review summary and fixed footer CTA.
3. `App.tsx` explicitly treats supplier private subroutes outside `/supplier/apply` as beyond the public prototype pass. It does **not** implement a fully functioning supplier workspace, approval queue, provider document vault or operational fulfilment. Any such screen in ZuriBeans must remain governed by its own established provider/repository.

## Integrated production route mapping

| Make experience | ZuriBeans authoritative route | Source / guard |
| --- | --- | --- |
| Supplier entry / eligibility | `/sourcing/become-a-supplier` | Reuses Make split-screen portal presentation; live application CTA redirects through identity |
| Supplier application | `/supplier/apply` | Authenticated, existing repository/validation/server action; six rendered steps |
| Supplier resubmission | `/supplier/resubmit` | Status-gated, original server action; not a free-standing client-side mutation |
| Supplier overview | `/supplier` | Existing authenticated supplier lifecycle, verification, organisation, capability and documentary projection |
| Visual demo | `/dev/supplier` | Opt-in, deterministic, never stores applications or issues principals |
| Fixture laboratory | `/dev/experience` | Links to synthetic supplier preview |

The split-screen design lives in `src/components/supplier/supplier-portal-entry.tsx`; the selectable certificate cards in `src/components/supplier/supplier-certification-picker.tsx`. Production status still comes exclusively from `getSupplierApplicationForCustomer` and status presentation, **not** `DEMO_SUPPLIER_JOURNEYS`.

## Presentation and behavior contract

- Forest-green `#0F2C24`, warm canvas `#F7F2E9`, gold `#C9A227`, Source Serif 4/Sans 3, large lightweight editorial headings, cream content, understated borders, comfortable touch targets.
- Six-step vertical supplier journey: Business → Contacts → Products & Capacity → Origin & Season → Certifications → Review & Submit; desktop connecting stepper, compact mobile step/dots and fixed footer.
- Business and contact fields, country, product categories, grade/variety/capacity/lead-time, origin and season map to the existing server-side `buildSupplierApplicationInput` and Zod schema. Never replace submitted input with synthetic values in production.
- Seven selectable certification names from the Make source and explicit "None — applying for first time"; three certificate entries are currently supported by the canonical application contract. When selecting more than three, the interface must refuse the extra selection rather than silently losing it. Other names can still be typed.
- All certificate declarations stay **unverified**; documentation is metadata only, not uploaded, hosted or downloaded from the estate.
- Production applications remain login-gated; resubmission remains limited to allowed statuses and requires the same source-of-truth customer session. There is no fake success page.
- `/dev/supplier` renders prefilled selectable journeys for ten fictitious organisations in five countries, with timestamps and example documentary references. It is unavailable outside `NODE_ENV=development && ZB_DEV_DATA_MODE=synthetic`, and all fields are illustration-only. Its submit action is disabled and cannot touch the supplier repository.

## Explicit provider gaps

The Make prototype also displays a free-text **website**, **origin district/region** and an unlimited add-another-product interaction. Current production input has registration/tax fields, per-product country/season, and a fixed maximum of three capabilities/certifications. Do not add fields which appear persisted but are discarded by the backend. A future upgrade must extend the canonical form, its validation, database/provider projection, resubmission read-back and test contracts *together*. No application should imply a 5-day service-level commitment without sourcing policy authority.

## Acceptance and regression coverage

- Validate 320/390/768/1024/1440px with Make screenshots, desktop/mobile sticky navigation, progress semantics, keyboard operation, focus visibility and form preservation across steps.
- Negative scenarios: anonymous login redirection; existing application redirect; failed read denies mutation; non-editable resubmission rejected; no auto-approval; no synthetic status leaked into production; no fake certificate verification; no duplicate data sources.
- Unit tests cover certificate choices, form serialization, maximum fields and empty declaration; fixture tests confirm unique supplier identities and lack of real CP principals.
- Keep CSS <64 KiB, client JS <800 KiB, Lighthouse performance ≥90, WCAG 2.2 AA, performance and architecture quality gates unchanged.

**Follow-on design task:** when a complete Figma supplier dashboard is supplied, match its precise screen hierarchy separately; the current Make source contains only a portal-entry treatment for that route, not a full authenticated dashboard design.
