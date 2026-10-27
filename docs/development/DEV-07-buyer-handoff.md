# DEV-07 confidential buyer handoff

Authority: Accepted Shared ADR-SHARED-042 CAA-04/05 and ADR-SHARED-043.
This increment joins the existing confidential IAM BFF to Trade's maintained
buyer-context operation. It does not activate a purchase, RFQ, quotation,
provider, protected environment or production profile.

Enable `ZURIBEANS_IAM_BFF_ENABLED`, the existing verified-TLS Redis confidential
store, and `ZURIBEANS_BUYER_HANDOFF_ENABLED=true`. Set
`ZURIBEANS_TRADE_BASE_URL` to the deployment-owned HTTPS Trade origin. The
legacy Medusa URL, customer cookie, browser parameters and identity claims
cannot supply this destination or purchasing authority.

`POST /api/buyer/context` accepts only JSON containing `organisationId`,
`countryCode` and the current session's `csrfToken`. Organisation/country are
explicit selection requests. The route checks exact origin, duplicate-cookie
refusal, private custody, body bounds and CSRF before making network calls.
It introspects the current human IAM evidence, obtains a separate BFF workload
grant with `trade:buyer-handoff` for `baobab-trade`, independently introspects
that exact client/audience/scope, then presents both pieces of evidence to
Trade. The BFF never calls CP, creates a Principal or asserts a tenant/role.
Trade resolves the actual current CP Principal, estate binding, buyer
membership and selected Organisation/Market on every request.

The response contains only a display summary of Organisation, canonical Market,
roles and bounded expiry. No token, canonical Principal, raw context, decision
or private session object is returned. The summary is not a credential and
cannot be submitted back as authority. Invalid/revoked evidence, unknown
membership, wrong company/audience, stale or mismatched replies and dependency
failure refuse; no legacy Medusa fallback exists. Responses are private/no-store.

Issuer spelling is preserved exactly, including slashless Hydra issuers. Human
and BFF introspection require the single Trade audience. This closes the same
normalisation mismatch corrected in Trade #177 without widening trust.

## Qualification and rollback

Source tests exercise the actual route/protocol code with explicitly synthetic
transports and custody. They are not deployed IAM/CP/Trade or Redis proof.
The owning Infrastructure extension must exercise the actual Next HTTP route,
real TLS Redis, real native issuer and Trade HTTP, including CSRF, wrong company,
revocation, outages, exact source receipts and independent complete teardown.
Keep that observation separate from the already-qualified eight-case native
Trade-handler receipt. Do not change any historical INT-05 result here.

IAM must register the actual `/api/iam/callback` URI for the confidential estate
client. No request or test may substitute a different callback at runtime.
The existing login and account UI is not switched by this source increment;
full estate/browser qualification remains a separately reported obligation.
Disable the handoff flag and restore reviewed source pins to roll back. Revoke
owned credentials and dispose of the owned test topology; retain original
sanitized report/hash bytes. Never use a public token, CP SQL or an insecure
store as a workaround.
