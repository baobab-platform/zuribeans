import "server-only"
import { timingSafeEqual } from "node:crypto"

/**
 * Interim internal-API-key auth for zuribeans' own admin-only backend
 * routes (ADR-0009). zuribeans has no admin/staff actor of its own --
 * unlike baobab-trade's Medusa "user" actor or baobab-cp's Principal/
 * requireAdminRole chain, both reused as-is where they already exist (see
 * baobab-cp's docs/reconciliation/gate-zb03-authority-contract-freeze.md
 * §5, "what is already solid and must not be rebuilt") -- so a shared
 * bearer secret is the smallest real mechanism until a proper
 * internal/staff identity exists. A real caller (an operator, or a future
 * baobab-cp integration) supplies this secret out of band; this function
 * never accepts one over the network itself.
 */
export const isAuthorizedInternalRequest = (
  authorizationHeader: string | null,
  expectedApiKey: string,
): boolean => {
  if (!authorizationHeader) return false
  const [scheme, token] = authorizationHeader.split(" ")
  if (scheme !== "Bearer" || !token) return false

  const provided = Buffer.from(token)
  const expected = Buffer.from(expectedApiKey)
  // timingSafeEqual throws on mismatched lengths rather than returning
  // false -- checked explicitly so a wrong-length token still only ever
  // reveals "wrong", never triggers an unhandled exception.
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}
