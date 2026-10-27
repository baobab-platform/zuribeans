import "server-only"
import { z } from "zod"

/**
 * ZB-G03 confidential BFF configuration (IAM ADR-0010 section 0, ADR-IAM-0023).
 * Adapted from Nabhold's reviewed BFF (G04B). Provider-neutral BAOBAB_IAM_*
 * names (ADR-IAM-0023 section 100): the issuer runtime (Hydra first) is
 * never named here. No provider URL, client or credential may come from a
 * browser parameter, and disabled is the default.
 */
export class AuthenticationDenied extends Error {
  constructor() {
    super("Authentication unavailable or denied")
    this.name = "AuthenticationDenied"
  }
}

/** The only resource audience this BFF obtains tokens for (Shared identity/v1
 * buyer-identity-handoff.schema.json). A different audience is a different
 * downstream and needs its own explicit token (ADR-IAM-0023 sections 43-44). */
export const TRADE_AUDIENCE = "baobab-trade"
export const TRADE_BUY_SCOPE = "trade:buy"

export function secureUrl(value: string): URL {
  const u = new URL(value)
  if (u.protocol !== "https:" || u.username || u.password || u.search || u.hash)
    throw new AuthenticationDenied()
  return u
}

export interface AuthSettings {
  trustProxy?: boolean
  origin: string
  issuer: string
  clientId: string
  clientSecret: string
  redirectUri: string
  introspectionEndpoint: string
  algorithm: "RS256" | "ES256"
}

/** Deployment opt-in is separate from source readiness. No insecure local URL
 * exception, and no production profile until protected acceptance exists. */
export function readAuthSettings(
  env: Record<string, string | undefined> = process.env,
): AuthSettings | null {
  if (env.ZURIBEANS_IAM_BFF_ENABLED !== "true") return null
  try {
    // NODE_ENV=production is also used by protected staging builds, so the
    // deployment boundary is explicit.
    if (
      !["integration", "staging", "development"].includes(env.ZURIBEANS_IAM_ENVIRONMENT ?? "") ||
      env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
    )
      throw new Error()
    if (env.BAOBAB_IAM_AUDIENCE !== TRADE_AUDIENCE) throw new Error()
    const origin = secureUrl(env.ZURIBEANS_IAM_ORIGIN ?? "")
    if (origin.pathname !== "/") throw new Error()
    // Issuer identifiers compare exactly; URL.href would add a slash to Hydra.
    const issuer = env.BAOBAB_IAM_ISSUER ?? ""
    secureUrl(issuer)
    if (issuer.trim() !== issuer) throw new Error()
    const introspection = secureUrl(env.BAOBAB_IAM_INTROSPECTION_ENDPOINT ?? "")
    if (introspection.origin !== new URL(issuer).origin || origin.origin === new URL(issuer).origin)
      throw new Error()
    const clientId = z.string().min(1).max(256).regex(/^\S+$/).parse(env.BAOBAB_IAM_CLIENT_ID)
    const clientSecret = z.string().min(16).max(4096).parse(env.ZURIBEANS_IAM_CLIENT_SECRET)
    const algorithm = z
      .enum(["RS256", "ES256"])
      .parse(env.ZURIBEANS_IAM_ID_TOKEN_ALGORITHM ?? "RS256")
    const trustProxy =
      z.enum(["true", "false"]).parse(env.ZURIBEANS_IAM_TRUST_PROXY ?? "false") === "true"
    return {
      origin: origin.origin,
      issuer,
      clientId,
      clientSecret,
      redirectUri: new URL("/api/iam/callback", origin).href,
      introspectionEndpoint: introspection.href,
      algorithm,
      trustProxy,
    }
  } catch {
    throw new AuthenticationDenied()
  }
}
