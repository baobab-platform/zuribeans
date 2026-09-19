# ADR 0005: Buyer session storage

## Status

Accepted

## Context

Zuribeans needs real buyer authentication now: an authenticated `/account` shell is the
foundation the rest of Increment 2 and Increment 5 (organisation onboarding, RFQ, contract
pricing) build on. `baobab-platform/baobab-trade` has not published any custom B2B identity contract
(no company, approval-flow, or customer-auth API of its own — see `contracts.lock.yaml`), but
it runs stock Medusa v2 (`@medusajs/medusa` 2.20.1, confirmed by inspecting
`baobab-platform/baobab-trade/package.json`), which already provides customer registration and
email/password authentication as a framework feature. Using it is not inventing a shortcut
around Trade: Medusa's customer identity _is_ Trade's authoritative representation of a buyer,
per this repository's own B2B capability ownership rule ("Medusa-native … customers … must be
used first").

The open question was purely mechanical: the Medusa JS SDK's `sdk.auth.*` methods issue a JWT
and, by the SDK's own design, persist it through a pluggable storage backend before attaching
it to subsequent requests. Next.js Server Components are stateless per request, so the SDK's
default in-memory/localStorage storage methods do not carry a session across requests, and
localStorage would expose the token to client-side JavaScript regardless.

## Decision

- Configure the shared Medusa client (`src/lib/medusa/client.ts`) with
  `auth: { type: "jwt", jwtTokenStorageMethod: "custom", storage: cookieAuthStorage }`.
- `cookieAuthStorage` (`src/lib/auth/session-storage.ts`) implements the SDK's storage
  interface over a single httpOnly, `Secure` (in production), `SameSite=lax` cookie
  (`zb_session`). The token is written only from Server Actions (`login`, `register`,
  `logout`), the one place Next.js permits cookie mutation; it is read in Server Components
  wherever a request needs to know the current customer.
- Follow Medusa's own documented registration sequence exactly, rather than a shortened
  version: `sdk.auth.register` (registration token) → `sdk.store.customer.create` (passing that
  token as an explicit `Authorization` header, per the SDK's own example) → `sdk.auth.login`
  (session token, persisted via `cookieAuthStorage`). Deviating from this sequence is the kind
  of subtle error that would silently create Medusa identities without a matching customer
  record, or vice versa.
- `getCurrentCustomer()` treats any failure of `sdk.store.customer.retrieve()` — no cookie, an
  expired token, or Trade being unreachable — identically: return `null`. There is no separate
  "is the session valid" check to keep in sync with Medusa's own session semantics.
- Never treat a successful `getCurrentCustomer()` result as evidence of an approved trading
  relationship. It proves the visitor is who they say they are, nothing about their
  organisation's commercial status.

## Consequences

- No session state is held in this repository beyond the httpOnly cookie itself; Medusa
  remains the sole system of record for customer identity, matching "never create a shared
  operational database" and "no Zuribeans-owned duplicate of engine domain state."
- CSRF protection comes from the platform: Next.js Server Actions already reject cross-origin
  invocations, so no separate CSRF token was added for this form flow.
- Buyer organisation onboarding, roles and approval remain out of scope here, blocked on Trade
  publishing company/approval-flow contracts. `/account`'s copy says this explicitly rather than
  implying trading is available once signed in.
- If Trade later adds a dedicated B2B customer/company module or changes its auth provider
  configuration, only `src/lib/medusa/client.ts`, `src/lib/auth/*` and the two Server Actions
  need to change — page components consume `getCurrentCustomer()`, not the SDK directly.
