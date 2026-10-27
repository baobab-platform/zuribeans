// @vitest-environment node
import { randomBytes } from "node:crypto"
import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { authHandlers, SESSION } from "../oidc/handlers"
import { readAuthSettings, type AuthSettings } from "../oidc/settings"
import { ConfidentialSessionStore, type ConfidentialSession } from "../store/confidential-store"
import { readBuyerHandoffSettings, resolveBuyerHandoff } from "./handoff"

const ORG = "019a0915-a8c0-7000-8000-00000000a001"
const OTHER = "019a0915-a8c0-7000-8000-00000000a002"
const settings: AuthSettings = {
  origin: "https://zuribeans.example.test",
  issuer: "https://iam.example.test",
  clientId: "baobab-dev-zuribeans-bff",
  clientSecret: "private-bff-client-credential",
  redirectUri: "https://zuribeans.example.test/api/iam/callback",
  introspectionEndpoint: "https://iam.example.test/introspect",
  algorithm: "RS256",
}
const target = { endpoint: "https://trade.example.test/store/b2b/buyer-context" }
const selection = { organisationId: ORG, countryCode: "UG" }
const session = (): ConfidentialSession => ({
  issuer: settings.issuer,
  subject: "synthetic-human",
  accessToken: "private-human-evidence",
  csrfToken: "c".repeat(43),
  createdAt: Date.now() - 1000,
  expiresAt: Date.now() + 120000,
})

function peer(
  change: { human?: object; caller?: object; context?: object; failTrade?: boolean } = {},
) {
  const calls: Array<{ url: string; headers: Headers; body: string }> = []
  const fetcher = vi.fn<typeof fetch>(async (input, init) => {
    const url = String(input),
      body = String(init?.body ?? ""),
      headers = new Headers(init?.headers)
    calls.push({ url, headers, body })
    expect(init?.cache).toBe("no-store")
    expect(init?.redirect).toBe("error")
    if (url.endsWith("/.well-known/openid-configuration"))
      return Response.json({
        issuer: settings.issuer,
        authorization_endpoint: settings.issuer + "/authorize",
        token_endpoint: settings.issuer + "/token",
        jwks_uri: settings.issuer + "/jwks",
        response_types_supported: ["code"],
        code_challenge_methods_supported: ["S256"],
        id_token_signing_alg_values_supported: ["RS256"],
        token_endpoint_auth_methods_supported: ["client_secret_basic"],
      })
    if (url.endsWith("/token")) {
      expect(new URLSearchParams(body).get("grant_type")).toBe("client_credentials")
      expect(new URLSearchParams(body).get("scope")).toBe("trade:buyer-handoff")
      expect(new URLSearchParams(body).get("audience")).toBe("baobab-trade")
      expect(headers.get("authorization")).toBe(
        "Basic " + Buffer.from(settings.clientId + ":" + settings.clientSecret).toString("base64"),
      )
      return Response.json({
        access_token: "private-bff-evidence",
        expires_in: 60,
        token_type: "Bearer",
      })
    }
    if (url.endsWith("/introspect")) {
      const human = new URLSearchParams(body).get("token") === "private-human-evidence"
      return Response.json({
        active: true,
        iss: settings.issuer,
        sub: human ? "synthetic-human" : settings.clientId,
        client_id: settings.clientId,
        aud: ["baobab-trade"],
        scope: human ? "openid trade:buy" : "trade:buyer-handoff",
        exp: Math.floor(Date.now() / 1000) + (human ? 120 : 60),
        ...(human ? change.human : change.caller),
      })
    }
    expect(url).toBe(target.endpoint)
    if (change.failTrade) return Response.json({ private_token: "never-release" }, { status: 503 })
    expect(headers.get("authorization")).toBe("Bearer private-bff-evidence")
    expect(headers.get("authorization")).not.toContain("human")
    const request = JSON.parse(body)
    expect(request.subject_token).toBe("private-human-evidence")
    expect(request.requested_organisation_id).toBe(ORG)
    expect(request.requested_country_code).toBe("UG")
    expect(request).not.toHaveProperty("tenant_id")
    expect(request).not.toHaveProperty("principal_id")
    return Response.json({
      context_id: OTHER,
      decision_id: OTHER,
      correlation_id: request.correlation_id,
      actor_type: "HUMAN",
      actor_principal_id: OTHER,
      external_identity_id: OTHER,
      tenant_id: "tn_synthetic",
      digital_estate_id: "zuribeans",
      engine_instance_id: "ei_trade",
      canonical_organisation_id: ORG,
      buyer_organisation_id: "b2borg_synthetic",
      buyer_membership_id: "b2bmem_synthetic",
      membership_revision: 2,
      market_id: "market_ug",
      cp_context_id: OTHER,
      operation: "trade.buyer-context.resolve",
      policy_revision: "source-test-only",
      roles: ["BUYER"],
      decision: { outcome: "ALLOW", reasons: [] },
      evaluated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30000).toISOString(),
      private_token: "never-release",
      ...change.context,
    })
  })
  return { calls, fetcher }
}
afterEach(() => vi.unstubAllEnvs())

describe("confidential buyer handoff (source tests, not native qualification)", () => {
  it("uses distinct human and BFF evidence and returns only the selected display summary", async () => {
    const p = peer()
    const result = await resolveBuyerHandoff(session(), settings, target, selection, p.fetcher)
    expect(result).toMatchObject({ organisationId: ORG, marketId: "market_ug", roles: ["BUYER"] })
    expect(Object.keys(result).sort()).toEqual(["expiresAt", "marketId", "organisationId", "roles"])
    expect(JSON.stringify(result)).not.toMatch(/private|principal|token|context_id/)
  })
  it.each([
    { human: { active: false } },
    { human: { aud: ["baobab-trade", "other"] } },
    { caller: { sub: "synthetic-human" } },
    { caller: { active: false } },
    { caller: { scope: "trade:buy trade:buyer-handoff" } },
    { caller: { aud: "baobab-control-plane" } },
  ])("refuses invalid issuer evidence before forwarding to Trade: %j", async (change) => {
    const p = peer(change)
    await expect(
      resolveBuyerHandoff(session(), settings, target, selection, p.fetcher),
    ).rejects.toThrow()
    expect(p.calls.some((c) => c.url === target.endpoint)).toBe(false)
  })
  it.each([
    { canonical_organisation_id: OTHER },
    { correlation_id: OTHER },
    { expires_at: new Date(Date.now() + 300000).toISOString() },
    { decision: { outcome: "DENY", reasons: ["BUYER_NOT_AUTHORISED"] } },
    { roles: ["SUPER_ADMIN"] },
    { roles: ["BUYER", "BUYER"] },
  ])("refuses mismatched or stale derived context: %j", async (context) => {
    const p = peer({ context })
    await expect(
      resolveBuyerHandoff(session(), settings, target, selection, p.fetcher),
    ).rejects.toThrow()
  })
  it("has no Medusa, CP or insecure endpoint fallback", () => {
    expect(readBuyerHandoffSettings({})).toBeNull()
    expect(() =>
      readBuyerHandoffSettings({
        ZURIBEANS_BUYER_HANDOFF_ENABLED: "true",
        ZURIBEANS_TRADE_BASE_URL: "http://localhost",
      }),
    ).toThrow()
    expect(() =>
      readBuyerHandoffSettings({
        ZURIBEANS_BUYER_HANDOFF_ENABLED: "true",
        ZURIBEANS_TRADE_BASE_URL: "https://user:secret@trade.test",
      }),
    ).toThrow()
    expect(
      readBuyerHandoffSettings({
        ZURIBEANS_BUYER_HANDOFF_ENABLED: "true",
        ZURIBEANS_TRADE_BASE_URL: "https://trade.test",
      }),
    ).toEqual({ endpoint: "https://trade.test/store/b2b/buyer-context" })
    const auth = readAuthSettings({
      ZURIBEANS_IAM_BFF_ENABLED: "true",
      ZURIBEANS_IAM_ENVIRONMENT: "development",
      ZURIBEANS_IAM_ORIGIN: settings.origin,
      BAOBAB_IAM_ISSUER: settings.issuer,
      BAOBAB_IAM_CLIENT_ID: settings.clientId,
      ZURIBEANS_IAM_CLIENT_SECRET: settings.clientSecret,
      BAOBAB_IAM_AUDIENCE: "baobab-trade",
      BAOBAB_IAM_INTROSPECTION_ENDPOINT: settings.introspectionEndpoint,
    })
    expect(auth?.issuer).toBe(settings.issuer)
  })
  it("checks origin, custody and CSRF before network work and emits no credentials", async () => {
    const records = new Map<string, string>()
    const store = new ConfidentialSessionStore(
      {
        execute: async ([op, key, value]) => {
          if (op === "SET") {
            records.set(key, value)
            return "OK"
          }
          if (op === "DEL") return records.delete(key) ? 1 : 0
          return records.get(key) ?? null
        },
      },
      { active: "test", keys: { test: randomBytes(32) } },
      "source-test",
    )
    const value = session(),
      handle = await store.createSession(value),
      p = peer()
    const handlers = authHandlers({
      settings: () => settings,
      store: () => store,
      buyerSettings: () => target,
      fetcher: p.fetcher,
    })
    const request = (body: object, origin = settings.origin, cookie = SESSION + "=" + handle) =>
      new NextRequest(settings.origin + "/api/buyer/context", {
        method: "POST",
        headers: { origin, "content-type": "application/json", cookie },
        body: JSON.stringify(body),
      })
    for (const req of [
      request({ ...selection, csrfToken: "x".repeat(43) }),
      request({ ...selection, csrfToken: value.csrfToken }, "https://attacker.test"),
      request({ ...selection, csrfToken: value.csrfToken, tenant_id: "tn_other" }),
      request(
        { ...selection, csrfToken: value.csrfToken },
        settings.origin,
        SESSION + "=" + handle + "; " + SESSION + "=" + handle,
      ),
    ]) {
      const response = await handlers.buyerContext(req)
      expect(response.status).toBe(401)
      expect(response.headers.get("cache-control")).toBe("private, no-store")
    }
    expect(p.fetcher).not.toHaveBeenCalled()
    const response = await handlers.buyerContext(
      request({ ...selection, csrfToken: value.csrfToken }),
    )
    expect(response.status).toBe(200)
    expect(await response.text()).not.toMatch(/private|principal|token|context_id/)
  })
})
