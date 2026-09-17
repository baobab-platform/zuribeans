/**
 * Shared between the SSO login action (src/app/login/actions.ts) and the
 * OIDC callback route (src/app/api/auth/callback/route.ts): the "return to"
 * cookie that survives the round trip to Baobab IAM and back. The
 * zuribeans-oidc provider's `state` parameter is generated and owned by
 * Trade's @medusajs/auth-oidc provider (baobab-trade/src/baobab/auth/
 * providers.ts) for CSRF protection -- zuribeans never reads or sets it, and
 * cannot smuggle `next` through it. A short-lived cookie set immediately
 * before the redirect to IAM is the standard mechanism for this, mirroring
 * how src/proxy.ts already sets a cookie ahead of a subsequent request
 * rather than relying on query-string round-tripping through a third party.
 */
export const POST_SSO_REDIRECT_COOKIE_NAME = "zb_post_sso_redirect"

/**
 * Bounds how long a pending SSO login may take before its `next` target is
 * forgotten (falling back to "/account") -- generous enough for a real IAM
 * login flow, short enough that a stale cookie from an abandoned attempt
 * does not linger.
 */
export const POST_SSO_REDIRECT_MAX_AGE_SECONDS = 60 * 10
