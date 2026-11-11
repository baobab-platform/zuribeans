# ADR 0015: Confidential IAM BFF for buyer authentication

## Status

Proposed

## Context

ZB-G03 (`docs/go-live/ZB-GOLIVE-MP-001.md`) needs buyer sign-in that platform services can trust.
The existing flow (ADR 0005, `src/app/api/auth/callback/route.ts`) is Medusa's own customer
session: Trade's `zuribeans-oidc` auth provider hands back a Medusa JWT that this estate keeps in
`zb_session`. That token proves a Medusa customer record exists. It is not platform identity
evidence, and it says nothing about a canonical Principal, tenant, buyer Organisation or
purchasing authority.

The owner's ZB-G03 ruling, recorded in IAM ADR-0010 section 0 and Shared
`contracts/identity/v1/buyer-identity-handoff.schema.json`, settles authority:

- Ory Kratos (authentication) and Hydra (OAuth 2.0/OIDC) are the first IAM runtime; Keycloak is
  federation and transition only (ADR-IAM-0033).
- Medusa is not a platform identity authority. No commerce operation proceeds on a Medusa token
  alone.
- The ZuriBeans BFF is a confidential client that carries IAM evidence server-side
  (ADR-IAM-0023). It creates no identity, context or authority.
- The Control Plane resolves issuer/subject to the canonical Principal and context; Trade is the
  purchasing authority and independently checks buyer membership on every operation.

This ADR is step 2 of the owner's sequence. Step 3 (CP/Trade binding) and step 4 (real-component
acceptance) are separate changes.

## Decision

### A confidential authorization-code BFF beside the Medusa session

`src/lib/iam/**` and `src/app/api/iam/{login,callback,session,logout}` implement a standards-only
OIDC confidential client. It is adapted from Nabhold's reviewed BFF and names no provider: the
issuer runtime (Hydra first) is reached only through its published discovery metadata, so Kratos,
Hydra or a federated provider can sit behind the issuer without code changes.

- **Login (`POST /api/iam/login`).** Exact `Origin` and `Sec-Fetch-Site` checks, issuer-pinned
  discovery, PKCE S256, random `state` and `nonce`, scope `openid trade:buy`, and
  `audience=baobab-trade`. The transaction is stored server-side. The browser only gets two
  random `__Host-` handles (attempt and browser binding).
- **Callback (`GET /api/iam/callback`).** The transaction is consumed once (GETDEL) before any
  code, state or network check. The code is exchanged with the client secret, and the ID token is
  verified (signature, issuer, audience, nonce, algorithm). The access token is then introspected.
  It must be active, for this subject and client, audience-bound to `baobab-trade`, and carry
  `trade:buy`. Login rotates the session handle and revokes a presented old one.
- **Session (`GET /api/iam/session`).** It introspects again on every read and returns only
  `{ authenticated, expiresAt, csrfToken }`. No subject, Principal, tenant, organisation, email,
  role or token reaches the browser.
- **Logout (`POST /api/iam/logout`).** It needs the per-session CSRF token. It revokes local
  custody and does not claim to end the provider's SSO session.

Tokens are held in an AES-256-GCM confidential store over verified-TLS Redis
(`ZURIBEANS_BFF_*`), keyed under `zuribeans:bff:v1:<epoch>:`. There is no in-memory or
cookie fallback.

### What the BFF deliberately does not do

- It does not call the Control Plane. `/v1/platform-context/resolve` is workload-only
  (`context:resolve`), and resolving the Principal and buyer context is Trade's job at each
  operation (step 3). The session summary therefore proves only that the person is currently
  signed in.
- It reads no ID-token or introspection claim for organisation, group, role, tenant or email,
  and it never infers buyer membership from them or from a browser-selected organisation.
- It does not read, replace or upgrade `zb_session`. The Medusa session keeps working for the
  catalogue and cart flows that still need it, and it remains insufficient for any commerce
  authority decision.
- It uses no Keycloak admin, Hydra admin or Kratos admin API (ADR-IAM-0023 sections 102-103).

### Configuration and enablement

The BFF is disabled unless `ZURIBEANS_IAM_BFF_ENABLED=true` and `ZURIBEANS_BFF_STORE_ENABLED=true`.
When enabled, the configuration is fail-closed:

- `ZURIBEANS_IAM_ENVIRONMENT` must be `integration`, `staging` or `development`. There is no
  production profile until protected acceptance exists.
- Every URL must be HTTPS with no credentials, query or fragment.
- The introspection endpoint must share the issuer's origin, and the estate origin must differ
  from it.
- `BAOBAB_IAM_AUDIENCE` must be exactly `baobab-trade`.
- `NODE_TLS_REJECT_UNAUTHORIZED=0` is refused.

The issuer, audience, client ID and introspection endpoint use the provider-neutral `BAOBAB_IAM_*`
names (ADR-IAM-0023 section 100). Estate-local values use `ZURIBEANS_IAM_*`.

## Consequences

- Enabling this needs IAM-owned work that does not exist yet:
  - a registered confidential client for this estate, with redirect URI
    `<origin>/api/iam/callback`, allowed scopes `openid trade:buy` and audience `baobab-trade`;
  - a deployed Hydra login/consent provider backed by Kratos. Today IAM ships only the
    `NativeHumanHandoff` library, and `hydra.yml` login/consent URLs are placeholders.

  Until both exist, no real sign-in can complete through this BFF, and nothing here may be
  represented as connected IAM acceptance.

- The tests use synthetic issuers, keys and tokens through an injected fetcher and an in-memory
  backend. They prove the protocol and fail-closed checks only. They are not evidence of IAM,
  CP or Trade qualification, production certification or go-live readiness.
- The UI is not switched to this flow yet. `/login` and `/account` keep the ADR 0005 behaviour
  until step 3 gives Trade an operation that consumes the BFF's evidence. Switching the UI then
  is a separate change.
- ADR 0005's statement that Medusa's customer identity is "Trade's authoritative representation
  of a buyer" is superseded for authorization purposes by the ZB-G03 ruling. A Medusa customer is
  a commerce record, not identity or purchasing evidence.
