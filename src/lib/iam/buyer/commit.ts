import "server-only"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import type { ConfidentialSession } from "../store/confidential-store"
import { AuthenticationDenied, type AuthSettings, secureUrl } from "../oidc/settings"
import { requireCurrentIamSession } from "../oidc/authority"
import { fetchJson } from "../oidc/transport"
import { buyerSelection, readBuyerHandoffSettings } from "./handoff"
import { currentBffWorkloadCredential } from "./workload"

/** A selector and replay key, never native money, authority or order facts. */
export const buyerCommitSelection = buyerSelection
  .extend({
    cartId: z.string().regex(/^cart_[A-Za-z0-9_-]{6,128}$/),
    idempotencyKey: z.string().regex(/^[A-Za-z0-9._:-]{16,128}$/),
  })
  .strict()
export type BuyerCommitSelection = z.infer<typeof buyerCommitSelection>

export type BuyerCommitTarget = { endpoint: string; publishableKey: string }

/** Separate explicit development activation; buyer-context is not checkout. */
export function readBuyerCommitSettings(
  env: Record<string, string | undefined> = process.env,
): BuyerCommitTarget | null {
  if (env.ZURIBEANS_BUYER_COMMIT_ENABLED !== "true") return null
  if (
    !["development", "integration"].includes(env.ZURIBEANS_IAM_ENVIRONMENT ?? "") ||
    env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
  )
    throw new AuthenticationDenied()
  const handoff = readBuyerHandoffSettings(env)
  if (!handoff) throw new AuthenticationDenied()
  const base = secureUrl(handoff.endpoint)
  if (base.pathname !== "/store/b2b/buyer-context") throw new AuthenticationDenied()
  return {
    endpoint: new URL("/store/b2b/buyer-commit", base).href,
    publishableKey: handoff.publishableKey,
  }
}

const answer = z
  .object({
    outcome: z.enum(["COMMITTED", "REPLAYED"]),
    order_id: z.string().regex(/^order_[A-Za-z0-9_-]{6,128}$/),
    correlation_id: z.string().uuid(),
  })
  .strict()

/** The browser never supplies tax, duty, freight, total, buyer Principal,
 * seller mandate or canonical event ID. The Trade owner must independently
 * resolve and recheck each consequential fact and enforce the same-XID fence.
 */
export async function commitBuyerPurchase(
  session: ConfidentialSession,
  settings: AuthSettings,
  target: BuyerCommitTarget,
  selection: BuyerCommitSelection,
  fetcher: typeof fetch = fetch,
) {
  try {
    selection = buyerCommitSelection.parse(selection)
    const endpoint = secureUrl(target.endpoint)
    if (
      endpoint.pathname !== "/store/b2b/buyer-commit" ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.origin === new URL(settings.issuer).origin ||
      !/^pk_[A-Za-z0-9_-]{16,512}$/.test(target.publishableKey)
    )
      throw new Error()
    const human = await requireCurrentIamSession(session, settings, fetcher)
    const caller = await currentBffWorkloadCredential(settings, fetcher)
    const correlation = randomUUID()
    if (Date.now() >= Math.min(human.tokenExpiresAt, caller.expiresAt)) throw new Error()
    const response = answer.parse(
      await fetchJson(
        endpoint.href,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${caller.accessToken}`,
            "Content-Type": "application/json",
            "X-Correlation-ID": correlation,
            "Idempotency-Key": selection.idempotencyKey,
            "x-publishable-api-key": target.publishableKey,
          },
          body: JSON.stringify({
            subject_token: session.accessToken,
            subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
            requested_organisation_id: selection.organisationId,
            requested_country_code: selection.countryCode,
            cart_id: selection.cartId,
            idempotency_key: selection.idempotencyKey,
            correlation_id: correlation,
          }),
        },
        fetcher,
      ),
    )
    if (response.correlation_id !== correlation) throw new Error()
    return { outcome: response.outcome, orderId: response.order_id }
  } catch {
    // No provider error, raw cart, token, mandate, or authority metadata leaves
    // the confidential BFF. Ambiguous outcomes require replay with the same key.
    throw new AuthenticationDenied()
  }
}
