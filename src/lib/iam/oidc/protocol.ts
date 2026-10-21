import "server-only"
import * as oidc from "openid-client"
import { createHash } from "node:crypto"
import { z } from "zod"
import { newOpaqueHandle, type LoginTransaction } from "../store/confidential-store"
import {
  AuthenticationDenied,
  secureUrl,
  TRADE_AUDIENCE,
  TRADE_BUY_SCOPE,
  type AuthSettings,
} from "./settings"
import { credentialFetch, fetchJson } from "./transport"

/** Use the maintained OAuth/OIDC implementation, including independent ID-token
 * signature verification (not enabled by default for TLS token responses).
 * Pin endpoints to the configured issuer origin before the library sees them.
 */
export async function discover(
  settings: AuthSettings,
  fetcher: typeof fetch = fetch,
): Promise<oidc.Configuration> {
  try {
    const s = z
      .object({
        issuer: z.literal(settings.issuer),
        authorization_endpoint: z.string(),
        token_endpoint: z.string(),
        jwks_uri: z.string(),
        response_types_supported: z.array(z.string()).refine((v) => v.includes("code")),
        code_challenge_methods_supported: z.array(z.string()).refine((v) => v.includes("S256")),
        id_token_signing_alg_values_supported: z
          .array(z.string())
          .refine((v) => v.includes(settings.algorithm)),
        token_endpoint_auth_methods_supported: z
          .array(z.string())
          .refine((v) => v.includes("client_secret_basic")),
      })
      .parse(
        await fetchJson(
          `${settings.issuer.replace(/\/$/, "")}/.well-known/openid-configuration`,
          {},
          fetcher,
        ),
      )
    for (const endpoint of [s.authorization_endpoint, s.token_endpoint, s.jwks_uri]) {
      if (secureUrl(endpoint).origin !== new URL(settings.issuer).origin) throw new Error()
    }
    // Construct a narrow metadata object; unreviewed optional aliases and
    // provider extensions must not change a credential destination or flow.
    const config = new oidc.Configuration(
      {
        issuer: s.issuer,
        authorization_endpoint: s.authorization_endpoint,
        token_endpoint: s.token_endpoint,
        jwks_uri: s.jwks_uri,
        code_challenge_methods_supported: ["S256"],
        response_types_supported: ["code"],
      },
      settings.clientId,
      { id_token_signed_response_alg: settings.algorithm },
      oidc.ClientSecretBasic(settings.clientSecret),
    )
    const transport = credentialFetch([s.token_endpoint, s.jwks_uri], fetcher)
    // The library permits Uint8Array bodies; normalize them to a Fetch BodyInit
    // without casting away its interface (Node/DOM typed arrays differ in TS 6).
    config[oidc.customFetch] = (url, options) =>
      transport(url, {
        ...options,
        body: options.body instanceof Uint8Array ? Buffer.from(options.body) : options.body,
      })
    config.timeout = 5
    oidc.enableNonRepudiationChecks(config)
    return config
  } catch {
    throw new AuthenticationDenied()
  }
}
export function begin(settings: AuthSettings, config: oidc.Configuration, now = Date.now()) {
  const transaction: LoginTransaction = {
    issuer: settings.issuer,
    clientId: settings.clientId,
    redirectUri: settings.redirectUri,
    scopes: ["openid", TRADE_BUY_SCOPE],
    state: newOpaqueHandle(),
    nonce: newOpaqueHandle(),
    codeVerifier: newOpaqueHandle(),
    createdAt: now,
    expiresAt: now + 300000,
  }
  const url = oidc.buildAuthorizationUrl(config, {
    response_type: "code",
    redirect_uri: transaction.redirectUri,
    // One explicit resource audience (ADR-IAM-0023 section 43): this token is
    // for Trade only. Other downstreams need their own token.
    scope: transaction.scopes.join(" "),
    audience: TRADE_AUDIENCE,
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge: createHash("sha256").update(transaction.codeVerifier).digest("base64url"),
    code_challenge_method: "S256",
  })
  return { transaction, url }
}
/** Caller MUST atomically consume the browser-bound transaction first, even
 * for malformed/error callbacks. An uncertain exchange is never retried.
 */
export async function exchange(
  settings: AuthSettings,
  transaction: LoginTransaction,
  callback: URL,
  fetcher: typeof fetch = fetch,
) {
  try {
    const p = callback.searchParams
    if (
      callback.origin + callback.pathname !== settings.redirectUri ||
      callback.hash ||
      p.getAll("state").length !== 1 ||
      p.getAll("code").length !== 1 ||
      p.getAll("iss").length > 1 ||
      p.has("error") ||
      !p.get("code") ||
      p.get("code")!.length > 4096 ||
      p.get("state") !== transaction.state ||
      (p.has("iss") && p.get("iss") !== settings.issuer) ||
      transaction.issuer !== settings.issuer ||
      transaction.clientId !== settings.clientId ||
      transaction.redirectUri !== settings.redirectUri ||
      transaction.createdAt > Date.now() ||
      transaction.expiresAt <= Date.now()
    )
      throw new Error()
    const config = await discover(settings, fetcher)
    const tokens = await oidc.authorizationCodeGrant(config, new URL(callback.href), {
      pkceCodeVerifier: transaction.codeVerifier,
      expectedState: transaction.state,
      expectedNonce: transaction.nonce,
      idTokenExpected: true,
    })
    const id = tokens.claims()
    if (
      !id ||
      typeof id.sub !== "string" ||
      !id.sub ||
      id.sub.length > 256 ||
      !Number.isSafeInteger(id.exp) ||
      !Number.isSafeInteger(id.iat) ||
      id.iat > Date.now() / 1000 ||
      typeof tokens.access_token !== "string" ||
      !tokens.access_token ||
      tokens.access_token.length > 16384 ||
      tokens.token_type.toLowerCase() !== "bearer" ||
      !Number.isSafeInteger(tokens.expires_in) ||
      tokens.expires_in! < 1 ||
      tokens.expires_in! > 3600
    )
      throw new Error()
    const now = Date.now()
    const expiresAt = Math.min(id.exp * 1000, now + tokens.expires_in! * 1000, now + 900000)
    if (expiresAt - now < 1000) throw new Error()
    // Discard ID/refresh tokens, claims/roles/email and provider session cookies.
    return {
      issuer: settings.issuer,
      subject: id.sub,
      accessToken: tokens.access_token,
      csrfToken: newOpaqueHandle(),
      createdAt: now,
      expiresAt,
    }
  } catch {
    throw new AuthenticationDenied()
  }
}
