# Buyer portal

Status: Masterplan ZB-04 estate onboarding implementation merged; programme certification outstanding
Reviewed: 2026-09-27

## Implemented on main

PR #91 integrates buyer application/status, company profile, team roster, tax registrations,
delivery sites and secure invitation consumption. PR #77 also supplied invitation lifecycle UI.

The server-only Trade adapter consumes organisation relationships and capability snapshots.
Authentication remains customer identity, not approval or purchasing authority (ADR-0005).
The estate keeps no duplicate Trade organisation tables and uses private, uncached requests.

Navigation requires both an implemented estate route and an explicit Trade capability grant.
Company and team routes exist. Account catalogue, orders and documents routes do not yet exist;
even a positive upstream capability must not expose a broken link. This route-availability check
does not grant permission or replace server-side Trade authorization.

## Remaining acceptance work

- Qualify application, review, KYB, ERP commercial decision and activation in deployed composition.
- Verify invitation email delivery, expiry, acceptance and revocation against the deployed provider.
- Reconcile contract pins with merged Shared, Control Plane and IAM work before adopting changes.
- Retain buyer isolation and end-to-end evidence on one immutable release candidate.
- Implement purchasing and RFQ/quotation journeys under Frontend Gates 11–12.

Provider implementation status must be checked in its repository. Missing estate integration
evidence does not mean the provider has no implementation.

## Secure member invitations

Account admins invite a permitted buyer role through Trade. The estate generates an idempotency
key and receives membership/delivery status, never the newly issued bearer token.
Invitation acceptance submits the token to Trade; Trade owns validation and lifecycle decisions.
