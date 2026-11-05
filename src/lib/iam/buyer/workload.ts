import "server-only"
import { z } from "zod"
import { TRADE_AUDIENCE, secureUrl, type AuthSettings } from "../oidc/settings"
import { discover } from "../oidc/protocol"
import { fetchJson } from "../oidc/transport"

/** Existing IAM-registered confidential BFF credential, never a buyer grant.
 * Both context discovery and a consequential purchase must obtain an issuer
 * issued workload token distinct from the actual human trade:buy token.
 */
export const HANDOFF_SCOPE = "trade:buyer-handoff"

export async function currentBffWorkloadCredential(
  settings: AuthSettings,
  fetcher: typeof fetch = fetch,
): Promise<{ accessToken: string; expiresAt: number; tokenExpiresAt: number }> {
  const metadata = (await discover(settings, fetcher)).serverMetadata()
  const endpoint = secureUrl(metadata.token_endpoint ?? "")
  if (endpoint.origin !== new URL(settings.issuer).origin) throw new Error("IAM_ISSUER_UNAVAILABLE")
  const basic = Buffer.from(
    `${encodeURIComponent(settings.clientId)}:${encodeURIComponent(settings.clientSecret)}`,
  ).toString("base64")
  const headers = {
    Authorization: `Basic ${basic}`,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  const started = Date.now()
  const token = z
    .object({
      access_token: z.string().min(1).max(8192),
      token_type: z.string().refine((v) => v.toLowerCase() === "bearer"),
      expires_in: z.number().int().min(1).max(900),
    })
    .parse(
      await fetchJson(
        endpoint.href,
        {
          method: "POST",
          headers,
          body: new URLSearchParams({
            grant_type: "client_credentials",
            scope: HANDOFF_SCOPE,
            audience: TRADE_AUDIENCE,
          }).toString(),
        },
        fetcher,
      ),
    )
  const current = z
    .object({
      active: z.literal(true),
      iss: z.literal(settings.issuer),
      client_id: z.literal(settings.clientId),
      sub: z.literal(settings.clientId),
      aud: z
        .union([z.string(), z.array(z.string())])
        .refine(
          (v) =>
            (Array.isArray(v) ? v : [v]).length === 1 &&
            (Array.isArray(v) ? v[0] : v) === TRADE_AUDIENCE,
        ),
      scope: z
        .string()
        .refine((v) => v.split(" ").includes(HANDOFF_SCOPE) && !v.split(" ").includes("trade:buy")),
      exp: z.number().int().positive().safe(),
    })
    .passthrough()
    .parse(
      await fetchJson(
        settings.introspectionEndpoint,
        {
          method: "POST",
          headers,
          body: new URLSearchParams({ token: token.access_token }).toString(),
        },
        fetcher,
      ),
    )
  const tokenExpiresAt = current.exp * 1000
  const expiresAt = Math.min(started + token.expires_in * 1000, tokenExpiresAt)
  if (expiresAt <= Date.now() || tokenExpiresAt > started + 900000) {
    throw new Error("IAM_WORKLOAD_NOT_CURRENT")
  }
  return { accessToken: token.access_token, expiresAt, tokenExpiresAt }
}
