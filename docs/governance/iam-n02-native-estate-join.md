# N02 — first-party ZuriBeans development estate / IAM Go BFF contract

**Status:** DRAFT / SOURCE ONLY, N02 **NOT QUALIFIED**. Governing:
EA v2.3, EA-DEV DEV-03/04/14, IAM ADR-IAM-0023/0024/0025/0033,
Shared ADR-SHARED-042/043. No N04 provider support promotion.

## Decision: preserve current and new session owners

The existing Next.js `/api/iam/*` BFF is an **estate-owned** confidential
OIDC/B2B buyer handoff. The separate IAM Go `/auth/*` service in IAM #146/#147
is a **native IAM proof boundary** which resolves a current **CP human
Principal** under a *different* opaque cookie, assurance and revocation policy.

These sessions are intentionally **not interchangeable**. The qualification
page `/identity/native-qualification` uses only the Go BFF. It must not
interpret the Go BFF login as the legacy Medusa customer or existing Next
buyer session. The existing login, customer and buyer routes are unchanged.
No production cutover, shared session key, duplicate Principal creation,
email-as-Principals or automatic customer synchronisation is authorised here.

The owner has added a gated, non-indexed first-party UI:
`ZURIBEANS_N02_NATIVE_QUALIFICATION_ENABLED=true` AND
`ZURIBEANS_IAM_ENVIRONMENT=development`. The page is 404 outside that
combination. It fetches `GET /auth/session` with same-origin cookies and
`no-store`, fails closed unless the strict token-free
`{authenticated,principal_id,csrf}` readback is valid, and never renders or
stores `principal_id` beyond a short-lived in-memory validation step. It
provides a normal browser POST sign-in, Kratos recovery navigation, and
CSRF-bound native all-session revocation. HTTP 503 or uncertain revocation
is **unavailable**, never a successful logout.

## Required native ingress before a real browser run

The N02 runner must reach a **single owned first-party HTTPS browser origin**:

- `GET /` and `GET /identity/native-qualification` are served by
  this exact reviewed ZuriBeans Next.js source.
- `/auth/{start,login,consent,callback,session,recovery,logout,logout-all}`
  are served by the **separately supervised IAM Go BFF**, at the *same browser
  origin*. The estate's `/api/iam/*` must stay distinct.
- The Go process requires TLS and exact public `Host` equality and must
  observe a genuine TLS peer; an untrusted forwarded-proto header, plaintext
  reverse proxy or an automatic external Next.js rewrite **does not satisfy**
  this requirement. A reviewed TLS-capable ingress with verified upstream
  TLS and preserved Host is still to be implemented by its infrastructure
  owner. No broad proxy trust or `AllowTestLoopback` is allowed on a
  non-loopback browser origin.
- Real Kratos browser cookies, AAL2 step-up, recovery courier and real Hydra
  authorization-code flow must be reachable in the same tested browser.
  The separate CP Principal read identity must be provisioned under its
  exact Shared development registry ceiling; `PROVISIONED` is *not*
  `ACTIVE` and not a CP grant.
- Infrastructure #69 must observe actual original Chromium browser/CP and
  DEV-04 originals under a bounded disposable topology, including source
  SHAs and independently observed teardown. Source tests in this PR are
  never browser/CP/provider acceptance.

The connected journey must *start from this page*; IAM #147's Playwright
script now clicks the real "Continue with governed IAM" browser control
instead of injecting a synthetic form into a JSON response. This stops
standalone Go handler/unit fixtures from being counted as a qualified
ZuriBeans first-party user experience.

## Remaining decisions and blockers

A later reviewed owner decision must select how the **production estate**
will migrate/coexist with the current Next OIDC BFF, and must establish
which backend owns commerce buyer login. The N02 development proof
does **not** migrate accounts or permit the native Go session to drive Trade
purchases. Current CP Principal, buyer Organisation, Market/Site grants and
spend approval remain independent.

**Release hold:** no current live private ingress, real synthetic Kratos
recovery/AAL2 run, original Chromium receipt or independent CP authorization
evidence for these latest heads has been provided. No protected activation,
provider support promotion or merge.


## Kratos host-only cookie source correction

The native Go BFF expects a genuine Kratos browser session cookie in
`/auth/login`, `/auth/consent` and callback AAL2 checks. Separate
Kratos and estate **hostnames** with host-only cookies prevent that
cookie from ever reaching the Go BFF; broadening cookie Domain is not
the default design. Infrastructure #69's source ingress therefore
routes Kratos public `/self-service/*` and `/sessions/whoami` at
the exact **same first-party HTTPS origin** as this Next page and
IAM's `/auth/*` Go BFF, while Hydra stays at a separate HTTPS issuer.
Kratos Admin is not exposed. Current production Next `/api/iam/*`
sessions are separate and unchanged.

This route contract does not create or host a Kratos login or recovery
UI; the real Kratos-issued flow UI and its courier/TOTP remain
unimplemented as a fully connected estate consumer. The branch stays
draft until owners deploy the bound TLS topology, prove real cookies
and AAL2 readbacks, and preserve original browser/CP evidence.
