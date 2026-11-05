import "server-only"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import type { ConfidentialSession } from "../store/confidential-store"
import { AuthenticationDenied, secureUrl, type AuthSettings } from "../oidc/settings"
import { requireCurrentIamSession } from "../oidc/authority"
import { fetchJson } from "../oidc/transport"
import { currentBffWorkloadCredential } from "./workload"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const RESOURCE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/
const PUBLISHABLE_KEY = z.string().regex(/^pk_[A-Za-z0-9_-]{16,512}$/)
export const buyerSelection = z
  .object({
    organisationId: z.string().regex(UUID),
    countryCode: z.string().regex(/^[A-Z]{2}$/),
  })
  .strict()
export type BuyerSelection = z.infer<typeof buyerSelection>
export type BuyerHandoffSettings = { endpoint: string; publishableKey: string }

/** Separate opt-in from login. Only a deployment-owned HTTPS origin receives
 * credentials; legacy MEDUSA_BACKEND_URL and browser URLs cannot select it. */
export function readBuyerHandoffSettings(
  env: Record<string, string | undefined> = process.env,
): BuyerHandoffSettings | null {
  if (env.ZURIBEANS_BUYER_HANDOFF_ENABLED !== "true") return null
  try {
    const base = secureUrl(env.ZURIBEANS_TRADE_BASE_URL ?? "")
    if (base.pathname !== "/") throw new Error()
    return {
      endpoint: new URL("/store/b2b/buyer-context", base).href,
      publishableKey: PUBLISHABLE_KEY.parse(env.ZURIBEANS_TRADE_PUBLISHABLE_KEY),
    }
  } catch {
    throw new AuthenticationDenied()
  }
}

const context = z
  .object({
    context_id: z.string().regex(UUID),
    decision_id: z.string().regex(UUID),
    correlation_id: z.string().regex(UUID),
    actor_type: z.literal("HUMAN"),
    actor_principal_id: z.string().regex(UUID),
    external_identity_id: z.string().regex(UUID),
    tenant_id: z.string().regex(/^tn_[a-z0-9]+$/),
    digital_estate_id: z.string().regex(RESOURCE),
    engine_instance_id: z.string().regex(/^ei_[a-z0-9]+$/),
    canonical_organisation_id: z.string().regex(UUID),
    buyer_organisation_id: z.string().regex(/^(buyerorg|b2borg)_[a-z0-9]+$/),
    buyer_membership_id: z.string().regex(/^(buyermem|b2bmem)_[a-z0-9]+$/),
    membership_revision: z.number().int().positive().safe(),
    market_id: z.string().regex(RESOURCE),
    cp_context_id: z.string().regex(UUID),
    operation: z.literal("trade.buyer-context.resolve"),
    policy_revision: z.string().min(1).max(128),
    roles: z
      .array(
        z.enum([
          "BUYER",
          "SENIOR_BUYER",
          "APPROVER",
          "PROCUREMENT_MANAGER",
          "ACCOUNT_ADMIN",
          "VIEWER",
        ]),
      )
      .min(1)
      .max(6),
    decision: z
      .object({ outcome: z.literal("ALLOW"), reasons: z.array(z.never()).length(0) })
      .strict(),
    evaluated_at: z.string().datetime({ offset: true }),
    expires_at: z.string().datetime({ offset: true }),
  })
  .passthrough()

/** Each operation rechecks the human, obtains the BFF's separate credential,
 * and asks Trade to resolve Principal/estate/membership/current Market through
 * CP. Nothing in this function grants or persists purchasing authority. */
export async function resolveBuyerHandoff(
  session: ConfidentialSession,
  settings: AuthSettings,
  target: BuyerHandoffSettings,
  selection: BuyerSelection,
  fetcher: typeof fetch = fetch,
) {
  try {
    selection = buyerSelection.parse(selection)
    const publishableKey = PUBLISHABLE_KEY.parse(target.publishableKey)
    const endpoint = secureUrl(target.endpoint)
    if (
      endpoint.pathname !== "/store/b2b/buyer-context" ||
      endpoint.origin === new URL(settings.issuer).origin
    )
      throw new Error()
    const human = await requireCurrentIamSession(session, settings, fetcher)
    const caller = await currentBffWorkloadCredential(settings, fetcher)
    if (Date.now() >= Math.min(human.expiresAt, caller.expiresAt)) throw new Error()
    const correlation = randomUUID()
    const result = context.parse(
      await fetchJson(
        endpoint.href,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${caller.accessToken}`,
            "Content-Type": "application/json",
            "X-Correlation-ID": correlation,
            // Required by Medusa's Store router. This is instance routing,
            // never estate provenance, buyer identity or permission to buy.
            "x-publishable-api-key": publishableKey,
          },
          body: JSON.stringify({
            subject_token: session.accessToken,
            subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
            requested_organisation_id: selection.organisationId,
            requested_country_code: selection.countryCode,
            correlation_id: correlation,
          }),
        },
        fetcher,
      ),
    )
    const now = Date.now(),
      evaluated = Date.parse(result.evaluated_at),
      expires = Date.parse(result.expires_at)
    if (
      result.correlation_id !== correlation ||
      result.canonical_organisation_id !== selection.organisationId ||
      evaluated > now + 1000 ||
      evaluated < now - 60000 ||
      expires <= now ||
      expires <= evaluated ||
      expires > evaluated + 60000 ||
      expires > human.tokenExpiresAt ||
      expires > caller.tokenExpiresAt ||
      new Set(result.roles).size !== result.roles.length
    )
      throw new Error()
    // expires_in is an integer duration and can conservatively round below
    // IAM's absolute expiry. Trade independently binds its context to the
    // absolute issuer bounds. Clip this token-free display summary to our
    // tighter custody/advertised deadline instead of rejecting that valid
    // context. The context itself is never returned or extended by the BFF.
    const summaryExpiry = Math.min(expires, human.expiresAt, caller.expiresAt)
    if (summaryExpiry <= now) throw new Error()
    // A narrow display summary only. Never expose either token, provider body,
    // Principal, raw context/decision or an opaque server-side session record.
    return {
      organisationId: result.canonical_organisation_id,
      marketId: result.market_id,
      roles: result.roles,
      expiresAt: summaryExpiry,
    }
  } catch {
    throw new AuthenticationDenied()
  }
}
