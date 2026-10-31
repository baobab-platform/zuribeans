/** A deliberately token-free, non-authorising N02 first-party display profile. */
export interface NativeSession {
  authenticated: true
  principal_id: string
  csrf: string
}

// The UI must not accept leaked issuer, tenant, membership, market, scope or
// token data. The CP Principal UUID is used only to validate the native BFF's
// exact shape; the UI never persists, displays or delegates it to Trade.
export function exactNativeSession(value: unknown): value is NativeSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return (
    Object.keys(record).sort().join(",") === "authenticated,csrf,principal_id" &&
    record.authenticated === true &&
    typeof record.principal_id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(record.principal_id) &&
    typeof record.csrf === "string" &&
    /^[A-Za-z0-9_-]{43}$/.test(record.csrf)
  )
}
