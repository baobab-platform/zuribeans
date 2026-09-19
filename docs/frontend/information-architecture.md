# ZuriBeans frontend information architecture

Status: Gate 2 complete  
Reviewed: 2026-09-13

## Principles

1. Public, buyer, and supplier experiences share one brand, token system, component library,
   accessibility standard, grid, and navigation philosophy.
2. They do not share commercial permissions or force unlike workflows into one route shell.
3. A visible route must be either functional against an authoritative contract, explicitly
   pending, or unavailable behind a controlled feature boundary. It must never simulate a
   transaction.
4. Product and market navigation is driven by normalized data. Reusable components do not contain
   Uganda, South Africa, coffee, or vanilla branching logic.
5. The current unsegmented URLs remain in place for this gate. Market-scoped URLs require an ADR
   because they change caching, canonical URLs, link construction, and Control Plane reconciliation.

## Experience map

| Experience      | Primary user goal                                                                                | Public indexability | Data classification                            |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------------- | ---------------------------------------------- |
| Public estate   | Understand offer, provenance, quality and trade capability; discover products; contact ZuriBeans | Indexable           | Public/static or market-scoped public data     |
| Buyer portal    | Manage an approved organisation and complete B2B purchasing work                                 | Never index         | Private, user and organisation scoped          |
| Supplier portal | Apply, maintain declarations and follow qualification status                                     | Never index         | Private, user and supplier-organisation scoped |

## Route hierarchy

Legend: **Now** means implementable with current authority; **Boundary** means navigation or an
explicit dependency state only; **Blocked** means no production route/action until a contract is
published and verified.

### Public estate

| Route                         | Navigation label       | State                   | Notes                                                                                                                                                    |
| ----------------------------- | ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                           | Home                   | Now                     | B2B value proposition, products, origins, trade method, quality, sourcing, cross-border capability and dual CTAs.                                        |
| `/products`                   | Products               | Now                     | Search/filter/pagination UI may consume only supported Store API fields. Provide card and procurement-oriented views where data supports them.           |
| `/products/[handle]`          | Product detail         | Now                     | Public specifications and provenance only; authorized commercial terms remain private.                                                                   |
| `/origins-markets`            | Origins & Markets      | Now                     | Data-driven market summaries; initial content for Uganda and South Africa without component-level branching.                                             |
| `/origins-markets/[market]`   | Market detail          | Now after content model | Validate against configured public market slugs, not arbitrary keys.                                                                                     |
| `/sourcing`                   | Sourcing               | Now                     | Sourcing standards, supplier profiles, process and supplier CTA.                                                                                         |
| `/sourcing/become-a-supplier` | Become a Supplier      | Now                     | Existing entry point, expanded without changing the supplier state machine.                                                                              |
| `/trade`                      | Trade                  | Now                     | Explain transaction classes, documentation, incoterm context, logistics coordination and how to engage; no operational claims beyond current capability. |
| `/quality-traceability`       | Quality & Traceability | Now                     | Standards, lots, certifications, chain-of-custody intent and verification language.                                                                      |
| `/about`                      | About                  | Now                     | Company, operating model, governance and Baobab-enabled capability in buyer language.                                                                    |
| `/contact`                    | Contact                | Now                     | Current mail route until an authoritative enquiry destination exists.                                                                                    |
| `/help`                       | Help                   | Now                     | Routes a buyer, supplier or account question to the existing channel that answers it; not a support ticketing system.                                    |
| `/login`                      | Portal sign-in         | Now                     | Neutral customer identity language; route may lead to buyer or supplier destination.                                                                     |
| `/register`                   | Create login           | Now                     | Personal identity only, never organisation approval.                                                                                                     |

Public pages receive route-specific metadata, canonical URLs, breadcrumb JSON-LD where applicable,
and organization/product structured data only when the facts are valid. No private price or false
Offer schema is emitted.

### Buyer portal

Use `/account` as the existing protected root until an accepted routing ADR renames it. The portal
must expose account approval before transactional navigation.

| Route                  | Label                | State                   | Required authority                                          |
| ---------------------- | -------------------- | ----------------------- | ----------------------------------------------------------- |
| `/account`             | Dashboard            | Now, pending-state only | Current customer identity                                   |
| `/account/company`     | Organisation Profile | Blocked                 | Trade buyer-organisation contract                           |
| `/account/team`        | Team                 | Blocked                 | Trade member/role contract and IAM entitlements             |
| `/account/approvals`   | Approval Authorities | Blocked                 | Trade purchasing-approval contract                          |
| `/account/catalogue`   | Catalogue            | Boundary                | Entitled catalogue and contract-pricing contract            |
| `/account/quick-order` | Quick Order          | Blocked                 | Entitlement, pricing, MOQ, availability and cart validation |
| `/account/rfqs`        | RFQs                 | Blocked                 | Baobab Trade RFQ contract                                   |
| `/account/quotations`  | Quotations           | Blocked                 | Baobab Trade quotation contract                             |
| `/account/orders`      | Orders               | Blocked                 | Buyer-scoped order projection                               |
| `/account/shipments`   | Shipments            | Blocked                 | Buyer-scoped shipment projection                            |
| `/account/documents`   | Documents            | Blocked                 | Trade-document contract and authorization                   |
| `/account/invoices`    | Invoices             | Blocked                 | ERP-to-Trade buyer projection                               |
| `/account/payments`    | Payments             | Blocked                 | Payment/settlement projection                               |
| `/account/settings`    | Account Settings     | Boundary                | Current customer update or future IAM profile contract      |

Until approval contracts exist, the buyer shell shows a single honest pending state and does not
display inert navigation masquerading as available functionality.

### Supplier portal

| Route                      | Label               | State    | Notes                                                                                                      |
| -------------------------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `/supplier`                | Application Status  | Now      | Existing status and declared capability summary.                                                           |
| `/supplier/apply`          | Application         | Now      | Existing submission; progressively split only if draft persistence is implemented.                         |
| `/supplier/profile`        | Supplier Profile    | Boundary | May display current organisation safely; editing needs explicit repository operations and lifecycle rules. |
| `/supplier/products`       | Products & Capacity | Boundary | Display current declarations; mutation requires accepted update semantics.                                 |
| `/supplier/certifications` | Certifications      | Boundary | Metadata display is safe; document upload is blocked.                                                      |
| `/supplier/documents`      | Documents           | Blocked  | Object storage, malware scanning, retention and authorization contract                                     |
| `/supplier/notifications`  | Notifications       | Blocked  | Notification contract and preferences model                                                                |

Supplier navigation is lifecycle-aware. Applicants see the next legitimate action for their
current state; they never receive controls for staff-owned qualification transitions.

## Primary navigation

Grouped into six labels rather than seven flat links, so related routes disclose together instead
of competing for header width. Desktop order and grouping (`docs/frontend/site-header.md` has the
full anatomy):

1. Commodities (disclosure: view all, then each supported product class)
2. Markets (disclosure: Origins & Markets, then each enabled market)
3. Trade (disclosure: How We Trade, Sourcing)
4. About Us
5. Resources (disclosure: Quality & Traceability, Become a Supplier, Supplier Portal, Help)
6. Contact

Disclosure content is built from the same authoritative sources as the rest of the estate —
`PUBLIC_PRODUCT_CLASSES` for Commodities, `MarketContext.enabled` for Markets — never a hardcoded
product or market list in the navigation component itself.

Utility bar (tier 1 of the header, desktop only):

- Market context, always available when more than one market is enabled.
- `Become a Supplier` and `Help` (routes to the public `/help` page).
- Portal sign-in for anonymous visitors, or an account link for authenticated visitors only when it
  can be resolved safely.

Primary commercial action: `Request a Quote`, linking to `/contact`, on wide layouts; this must not
crowd out navigation on tablet — see the header's own responsive rules for the exact breakpoint.

The header is server-rendered. Only the mobile disclosure control and each accessible
dropdown/disclosure may be a client island.

## Mobile navigation

The mobile header contains brand, current market, sign-in/account action, and one menu button. The
menu opens an accessible dialog or sheet with:

- the complete primary list;
- market selection;
- buyer portal entry;
- supplier entry;
- contact action.

Requirements: focus moves into the menu, Escape closes it, focus returns to the trigger, background
content is inert, body scrolling is controlled, and links are usable at 320 CSS pixels without
horizontal overflow.

## Market selector behaviour

- Display normalized `displayName` and `currency`; the component receives a `MarketContext`.
- Preserve the current pathname when switching.
- Retain only explicitly allowlisted query parameters; never carry auth errors, tokens, or private
  state into a market link.
- The server remains authoritative. A client selector may improve interaction but must not maintain
  an independent market store.
- If only one market is enabled, render a non-interactive context label rather than a false selector.

## Breadcrumb model

| Context              | Example                                 |
| -------------------- | --------------------------------------- |
| Product              | Home / Products / Product name          |
| Product class        | Home / Products / Coffee                |
| Market               | Home / Origins & Markets / Uganda       |
| Supplier application | Supplier / Application                  |
| Buyer resource       | Buyer Portal / Orders / Order reference |

Breadcrumb items are route/domain view models, not labels inferred by splitting URL strings.
Current-page items are text with `aria-current="page"`; ancestors are links. Public breadcrumbs may
emit valid BreadcrumbList structured data.

## Footer architecture

The footer uses five compact groups on wide screens and accordions or stacked groups on small
screens:

| Group    | Links/content                                                         |
| -------- | --------------------------------------------------------------------- |
| Products | Dynamic public product classes; never coffee-only                     |
| Trade    | Origins & Markets, Trade, Quality & Traceability                      |
| Partner  | Buyer Portal, Become a Supplier, Contact                              |
| Company  | About, governance/policy links when real                              |
| Context  | Current market, currency, operating-market statement and legal footer |

Do not publish placeholder privacy, terms, certification, warehouse, office, or regulatory claims.

## Navigation state and authorization

| User state                                  | Public estate       | Buyer portal                        | Supplier portal                                         |
| ------------------------------------------- | ------------------- | ----------------------------------- | ------------------------------------------------------- |
| Anonymous                                   | Full public content | Login/register entry only           | Public sourcing entry; login required to apply          |
| Authenticated, buyer status unknown/pending | Full public content | Pending/restricted dashboard        | Supplier application available if no application exists |
| Authenticated, buyer approved               | Full public content | Contract-backed features only       | Based independently on supplier lifecycle               |
| Supplier applicant                          | Full public content | Based independently on buyer status | Application/status features appropriate to lifecycle    |

A person may participate in both buyer and supplier journeys. Those relationships are independent;
the header must not infer one from the other.

## Route state contract

Every implemented route intentionally supports:

- loading with stable geometry;
- success;
- empty;
- partial upstream data;
- unauthorized (identity absent);
- forbidden/restricted (identity present, entitlement absent);
- validation failure;
- recoverable upstream failure;
- unavailable dependency;
- not found;
- unexpected error with a correlation reference.

Not every state belongs inside every component. Route-level boundaries own unexpected/loading/not
found behaviour; domain components own valid empty/partial/restricted states; forms own validation
errors.

## SEO and indexing boundary

- Index: public estate and valid public product/market detail routes.
- Do not index: `/account/**`, `/supplier/**`, `/login`, `/register`, cart, checkout, and any future
  private commerce route.
- `robots.ts` is a crawler hint, not an access control. Protected data remains server-authorized.
- Sitemap generation includes public canonical routes only and must tolerate Trade/CMS
  unavailability without publishing private or fabricated URLs.

## Gate 2 decision

Implement the design system and global shell against this hierarchy. Public pages can proceed.
Buyer and supplier links are exposed only to the degree their current authoritative state permits;
blocked routes are not built as decorative demos.
