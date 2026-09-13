# Authentication experience

Status: Gate 9 implemented  
Reviewed: 2026-09-13

Login, registration, logout and the protected account state retain the approved Medusa customer
session architecture from ADR-0005. This gate changes presentation and state clarity only.

## Security and access model

- Credentials continue through Server Actions and session tokens remain in HTTP-only cookie storage.
- Redirect targets continue through the existing safe-relative-path validator.
- Authentication identifies a customer; it never implies an approved buyer organisation.
- Account, login and registration routes declare noindex metadata.
- No company, role, entitlement or approval state is fabricated from customer metadata.

Because Baobab Trade has not published the buyer-company and approval contracts, every authenticated
customer receives the explicit restricted/pending experience. Company, team, quotation, order and
other commercial navigation stays absent rather than linking to empty or invented production
workflows.

## Accessibility

Forms use shared labelled controls, browser-compatible autocomplete values, visible focus treatment,
described password requirements and alert semantics for authentication errors. The two-column name
layout collapses to a single column on smaller screens.
