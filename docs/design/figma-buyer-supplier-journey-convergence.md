# Figma Make journey convergence — Buyer and Supplier portals

**Status:** Proposed in ZuriBeans PR #146. **Do not merge** until final-head checks, route/security qualification, and owner design review.

**Reference:** [ZuriBeans Figma Make prototype](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype): `src/pages/PortalEntry.tsx`, `BuyerDashboard.tsx`, `SupplierApplication.tsx`, `src/components/Nav.tsx`.

## Journey separation and URLs

| Role / intention      | Public entry                  | Login                                     | Registration         | Protected workspace | Application          |
| --------------------- | ----------------------------- | ----------------------------------------- | -------------------- | ------------------- | -------------------- |
| Buyer                 | `/buyer`                      | `/buyer/login`                            | `/buyer/register`    | `/account`          | `/account/apply`     |
| Supplier              | `/sourcing/become-a-supplier` | `/supplier/login`                         | `/supplier/register` | `/supplier`         | `/supplier/apply`    |
| Supplier resubmission | Supplier workspace only       | `/supplier/login?next=/supplier/resubmit` | n/a                  | `/supplier`         | `/supplier/resubmit` |

`/login` and `/register` remain backwards-compatible legacy customer-identity routes, **not** buyer/supplier authority or onboarding approval. The new role-specific presentation reuses the existing Medusa email/password identity provider, with role-specific redirect and onboarding destinations; it does not create a second identity silo. Only the already-qualified buyer OIDC is offered as SSO. Supplier SSO is withheld pending separate provider qualification.

The supplier login/registration pages are **outside** the authenticated route group, while `src/app/supplier/(workspace)/layout.tsx` protects the supplier overview, application and resubmission pages. The existing identity and supplier application backend operations remain authoritative. The buyer account layout continues to use `requireCustomer` and actual Trade capabilities.

Redirect handling must continue to use `toSafeRelativePath`; role-specific pages must also reject a requested `next` pointing into the other role's workspace. A buyer login alone does not confer buyer organisation or commitment authority. Supplier registration alone does not confer verified supplier, sourcing, ERP or documentary authority.

## Design composition

- Public login and registration: editorial two-panel composition matching the Make PortalEntry: dark forest title and brand side, canvas form panel, gold separator, serif heading, restrained labels, responsive stacking.
- Buyer public portal: professional procurement editorial cover and real onboarding path.
- Buyer dashboard: dark organisational header, responsive dark sidebar, actual organisation status, verified capabilities and separate capability-gated RFQ/quotation/order/shipment/document/invoice modules. **No sample count, fabricated buyer RFQ/order, price, shipment, or invoice is rendered as real.**
- Supplier dashboard: dark sourcing header and sidebar, application/qualification navigation, actual supplier status/organisation/capabilities/certification metadata, existing six-section supplier form and review/resubmit lifecycle.
- Site information architecture: public primary navigation remains Commodities, Markets, Trade, About, Resources and Contact. Utility-bar and mobile drawer distinguish buyer sign-in, supplier programme and supplier portal. Footer routes to the same canonical entry points.
- CTA states: common button variants preserve text contrast on ink, leaf, danger, light outline, dark inverse and gold surfaces. Focus remains visible. Use semantic variants rather than combining a default ink button with a conflicting foreground override.

## Authority / qualification gaps

The Make BuyerDashboard prototype contains static company context and fictional RFQ, quotation, order and shipment data. Those must **not** be shown in production. This PR implements the designed navigation and visible restricted states, not an unqualified transaction data source.

New provider-backed interaction on the RFQ / quotation, TMS or ERP workspaces still requires the governing DEV-07/08/09 Trade/IAM/CP contracts and negative test receipts; design convergence alone is not permission to introduce a native commercial commitment.

## Acceptance

1. `pnpm format:check`, lint, typecheck, unit tests, production build, Storybook/browser tests and architecture validation.
2. Functional E2E for public role-specific login/registration, scoped redirect handling, protected account access, supplier form and buyer/supplier navigation.
3. Responsive browser screenshots for buyer/supplier login at 390 and 1440px, plus owner inspection of dashboard and supplier application. Audit dark-surface CTA foreground and keyboard focus.
4. Keep the established 64 KiB CSS and 800 KiB JS budgets, Lighthouse and WCAG/visual regression gates unchanged.
5. Do not approve new homepage visual baselines in this PR without viewing all five changes and comparing to the prototype.
