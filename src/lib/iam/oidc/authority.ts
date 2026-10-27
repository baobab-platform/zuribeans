import "server-only"
import { z } from "zod"
import type { ConfidentialSession } from "../store/confidential-store"
import {
  AuthenticationDenied,
  TRADE_AUDIENCE,
  TRADE_BUY_SCOPE,
  type AuthSettings,
} from "./settings"
import { fetchJson } from "./transport"

/**
 * Every protected session read rechecks IAM: the token must still be active,
 * issued to this client for this subject, audience-bound to Trade and carry
 * trade:buy. This proves only that the person is currently signed in. It
 * resolves no canonical Principal, tenant, buyer Organisation or membership:
 * Trade does that for each operation (IAM ADR-0010 section 0; ZB-G03 step 3).
 * No ID-token claim, email, organisation claim or role is consulted.
 */
export async function requireCurrentIamSession(
  session: ConfidentialSession,
  settings: AuthSettings,
  fetcher: typeof fetch = fetch,
) {
  try {
    if (
      session.issuer !== settings.issuer ||
      session.expiresAt <= Date.now() ||
      session.createdAt > Date.now()
    )
      throw new Error()
    const basic = Buffer.from(
      `${encodeURIComponent(settings.clientId)}:${encodeURIComponent(settings.clientSecret)}`,
    ).toString("base64")
    const token = z
      .object({
        active: z.literal(true),
        iss: z.literal(settings.issuer),
        sub: z.literal(session.subject),
        aud: z.union([z.string(), z.array(z.string())]).refine((v) => {
          const values = Array.isArray(v) ? v : [v]
          return values.length === 1 && values[0] === TRADE_AUDIENCE
        }),
        exp: z.number().int().positive().safe(),
        client_id: z.literal(settings.clientId),
        scope: z.string().refine((v) => v.split(" ").includes(TRADE_BUY_SCOPE)),
      })
      .parse(
        await fetchJson(
          settings.introspectionEndpoint,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${basic}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ token: session.accessToken }).toString(),
          },
          fetcher,
        ),
      )
    const expiresAt = Math.min(session.expiresAt, token.exp * 1000)
    if (expiresAt <= Date.now()) throw new Error()
    return { expiresAt }
  } catch {
    throw new AuthenticationDenied()
  }
}
