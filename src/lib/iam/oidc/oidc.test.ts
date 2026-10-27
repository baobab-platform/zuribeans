// @vitest-environment node
import { generateKeyPairSync, randomBytes, sign, createHash } from "node:crypto"
import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { ConfidentialSessionStore, type ConfidentialBackend } from "../store/confidential-store"
import { authHandlers, ATTEMPT, BINDING, SESSION } from "./handlers"
import { readAuthSettings, type AuthSettings } from "./settings"
import { requireCurrentIamSession } from "./authority"
import { credentialFetch, limitedBody } from "./transport"

// This synthetic HTTPS protocol peer exercises the real OIDC library and signed
// JWT/JWKS verification. It is not evidence of deployed IAM acceptance. Real
// TLS Redis atomicity/expiry/ACL are covered by the mandatory integration suite.
const settings: AuthSettings = {
  origin: "https://estate.example.test",
  issuer: "https://iam.example.test/",
  introspectionEndpoint: "https://iam.example.test/introspect",
  clientId: "reviewed-fixture-client",
  clientSecret: "synthetic-client-secret",
  algorithm: "RS256",
  redirectUri: "https://estate.example.test/api/iam/callback",
}
const keys = generateKeyPairSync("rsa", { modulusLength: 2048 })
const json = (data: unknown, status = 200) => Response.json(data, { status })
function fixture(proxy = false) {
  const records = new Map<string, string>()
  const execute: ConfidentialBackend["execute"] = async ([op, key, value]) => {
    if (op === "SET") {
      if (records.has(key)) return null
      records.set(key, value)
      return "OK"
    }
    if (op === "DEL") return records.delete(key) ? 1 : 0
    const raw = records.get(key) ?? null
    if (op === "GETDEL") records.delete(key)
    return raw
  }
  const store = new ConfidentialSessionStore(
    { execute },
    { active: "test", keys: { test: randomBytes(32) } },
    "fixture",
  )
  let nonce = "",
    challenge = "",
    codeUsed = false
  let claims: Record<string, unknown> = {},
    inactive = false,
    signatureBad = false,
    tokenAudience = "baobab-trade",
    tokenScope = "openid trade:buy"
  let endpoint = settings.issuer + "token"
  let tokenLifetime = 600
  const fetcher = vi.fn<typeof fetch>(async (input, init) => {
    const url = String(input)
    if (url.endsWith("/.well-known/openid-configuration"))
      return json({
        issuer: settings.issuer,
        authorization_endpoint: settings.issuer + "authorize",
        token_endpoint: endpoint,
        jwks_uri: settings.issuer + "jwks",
        response_types_supported: ["code"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["client_secret_basic"],
        id_token_signing_alg_values_supported: ["RS256"],
      })
    if (url.endsWith("/jwks"))
      return json({
        keys: [
          { ...keys.publicKey.export({ format: "jwk" }), kid: "fixture", alg: "RS256", use: "sig" },
        ],
      })
    if (url.endsWith("/token")) {
      const body = new URLSearchParams(String(init?.body))
      expect(init?.redirect).toBe("error")
      expect(init?.cache).toBe("no-store")
      expect(
        Buffer.from(new Headers(init?.headers).get("authorization")!.slice(6), "base64")
          .toString()
          .split(":")
          .map((v) => decodeURIComponent(v.replace(/\+/g, " "))),
      ).toEqual([settings.clientId, settings.clientSecret])
      if (
        codeUsed ||
        body.get("code") !== "fixture-one-time-code" ||
        body.get("redirect_uri") !== settings.redirectUri ||
        createHash("sha256")
          .update(body.get("code_verifier") ?? "")
          .digest("base64url") !== challenge
      )
        return json({}, 400)
      codeUsed = true
      const now = Math.floor(Date.now() / 1000)
      const header = Buffer.from(JSON.stringify({ alg: "RS256", kid: "fixture" })).toString(
        "base64url",
      )
      const payload = Buffer.from(
        JSON.stringify({
          iss: settings.issuer,
          sub: "provider-subject-not-cp-uuid",
          aud: settings.clientId,
          exp: now + 600,
          iat: now,
          nonce,
          ...claims,
        }),
      ).toString("base64url")
      const data = `${header}.${payload}`
      const signature = sign(
        "sha256",
        Buffer.from(signatureBad ? data + "tampered" : data),
        keys.privateKey,
      ).toString("base64url")
      return json({
        access_token: "synthetic-private-access-token",
        token_type: "Bearer",
        expires_in: 600,
        id_token: `${data}.${signature}`,
        refresh_token: "synthetic-discard-refresh",
      })
    }
    if (url === settings.introspectionEndpoint)
      return json({
        active: !inactive,
        iss: settings.issuer,
        sub: "provider-subject-not-cp-uuid",
        aud: tokenAudience,
        client_id: settings.clientId,
        exp: Math.floor(Date.now() / 1000) + tokenLifetime,
        scope: tokenScope,
      })
    throw new Error("Unexpected fixture destination")
  })
  const handlers = authHandlers({
    settings: () => ({ ...settings, trustProxy: proxy }),
    store: () => store,
    fetcher,
  })
  function request(
    path: string,
    cookie = "",
    method = "GET",
    body?: string,
    origin = settings.origin,
  ) {
    return new NextRequest((proxy ? "https://0.0.0.0:3000" : settings.origin) + path, {
      method,
      headers: {
        cookie,
        origin,
        "sec-fetch-site": "same-origin",
        ...(proxy
          ? {
              host: "estate.example.test",
              "x-forwarded-host": "estate.example.test",
              "x-forwarded-proto": "https",
            }
          : {}),
        ...(body !== undefined ? { "content-type": "application/x-www-form-urlencoded" } : {}),
      },
      ...(body !== undefined ? { body } : {}),
    })
  }
  async function login() {
    const response = await handlers.login(request("/api/iam/login", "", "POST"))
    expect(response.status).toBe(303)
    const url = new URL(response.headers.get("location")!)
    nonce = url.searchParams.get("nonce")!
    challenge = url.searchParams.get("code_challenge")!
    expect(url.searchParams.get("scope")).toBe("openid trade:buy")
    expect(url.searchParams.get("audience")).toBe("baobab-trade")
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    const cookie = response.cookies
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ")
    return {
      response,
      cookie,
      callback:
        "/api/iam/callback?" +
        new URLSearchParams({
          state: url.searchParams.get("state")!,
          code: "fixture-one-time-code",
          iss: settings.issuer,
        }),
    }
  }
  return {
    records,
    store,
    handlers,
    request,
    login,
    fetcher,
    alter: (v: {
      claims?: Record<string, unknown>
      inactive?: boolean
      signatureBad?: boolean
      tokenAudience?: string
      tokenScope?: string
      endpoint?: string
      tokenLifetime?: number
    }) => {
      claims = v.claims ?? claims
      inactive = v.inactive ?? inactive
      tokenScope = v.tokenScope ?? tokenScope
      signatureBad = v.signatureBad ?? signatureBad
      tokenAudience = v.tokenAudience ?? tokenAudience
      endpoint = v.endpoint ?? endpoint
      tokenLifetime = v.tokenLifetime ?? tokenLifetime
    },
  }
}
afterEach(() => vi.unstubAllEnvs())
describe("OIDC login, confidential callback and current IAM session", () => {
  it("uses the configured public callback behind an explicitly trusted TLS proxy", async () => {
    const f = fixture(true),
      login = await f.login()
    const callback = await f.handlers.callback(f.request(login.callback, login.cookie))
    expect(callback.status).toBe(200)
    expect(callback.headers.get("location")).toBeNull()
    const session = callback.cookies.get(SESSION)!
    expect(session.sameSite).toBe("strict")
    expect(
      (await f.handlers.session(f.request("/api/iam/session", `${SESSION}=${session.value}`)))
        .status,
    ).toBe(200)
  })
  it("commits a fixed script-free completion document without reflecting OAuth or identity values", async () => {
    const f = fixture(),
      login = await f.login()
    const response = await f.handlers.callback(f.request(login.callback, login.cookie))
    expect(response.status).toBe(200)
    expect(response.headers.get("location")).toBeNull()
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8")
    expect(response.headers.get("cache-control")).toContain("no-store")
    expect(response.headers.get("referrer-policy")).toBe("no-referrer")
    expect(response.headers.get("x-frame-options")).toBe("DENY")
    expect(response.headers.get("content-security-policy")).toBe(
      "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    )
    const body = await response.text()
    expect(body).toContain('<meta http-equiv="refresh" content="0;url=/account">')
    expect(body).toContain('<a href="/account">')
    expect(body).not.toMatch(/<script|<form|https:|state=|code=/)
    for (const privateValue of [
      "fixture-one-time-code",
      "provider-subject-not-cp-uuid",
      "synthetic-private-access-token",
      response.cookies.get(SESSION)!.value,
      ...new URLSearchParams(login.callback.split("?")[1]).values(),
    ]) {
      expect(body).not.toContain(privateValue)
    }
    const session = response.cookies.get(SESSION)!
    expect(session).toMatchObject({ secure: true, httpOnly: true, sameSite: "strict", path: "/" })
    expect((await f.handlers.callback(f.request(login.callback, login.cookie))).status).toBe(401)
  })
  it("does not trust proxy headers without deployment opt-in", async () => {
    const f = fixture(),
      request = new NextRequest("https://0.0.0.0:3000/api/iam/login", {
        method: "POST",
        headers: {
          host: "estate.example.test",
          "x-forwarded-host": "estate.example.test",
          "x-forwarded-proto": "https",
          origin: settings.origin,
          "sec-fetch-site": "same-origin",
        },
      })
    expect((await f.handlers.login(request)).status).toBe(401)
    expect(f.fetcher).not.toHaveBeenCalled()
    expect(f.records.size).toBe(0)
  })
  it("checks trusted proxy headers even when Next already reports the public origin", async () => {
    const f = fixture(true)
    const request = new NextRequest(settings.origin + "/api/iam/login", {
      method: "POST",
      headers: {
        host: "estate.example.test",
        "x-forwarded-host": "attacker.test",
        "x-forwarded-proto": "https",
        origin: settings.origin,
        "sec-fetch-site": "same-origin",
      },
    })
    expect((await f.handlers.login(request)).status).toBe(401)
    expect(f.fetcher).not.toHaveBeenCalled()
    expect(f.records.size).toBe(0)
  })
  it.each([
    ["host", "attacker.test"],
    ["x-forwarded-host", "attacker.test"],
    ["x-forwarded-host", "estate.example.test,attacker.test"],
    ["x-forwarded-host", ""],
    ["x-forwarded-proto", "http"],
    ["x-forwarded-proto", "https,http"],
    ["x-forwarded-proto", ""],
    ["origin", "https://attacker.test"],
    ["sec-fetch-site", "cross-site"],
  ])("rejects ambiguous or untrusted proxy input %s=%s before credentials", async (key, value) => {
    const f = fixture(true),
      original = f.request("/api/iam/login", "", "POST")
    const headers = new Headers(original.headers)
    headers.set(key, value)
    const request = new NextRequest(original.url, { method: "POST", headers })
    expect((await f.handlers.login(request)).status).toBe(401)
    expect(f.fetcher).not.toHaveBeenCalled()
    expect(f.records.size).toBe(0)
  })
  it("completes signed OIDC + S256 + current Trade-audience IAM token, exposing only an opaque session", async () => {
    const f = fixture(),
      login = await f.login()
    for (const c of login.response.cookies.getAll()) {
      expect(c.secure).toBe(true)
      expect(c.httpOnly).toBe(true)
      expect(c.sameSite).toBe("lax")
      expect(c.path).toBe("/")
    }
    const callback = await f.handlers.callback(f.request(login.callback, login.cookie))
    expect(callback.status).toBe(200)
    expect(callback.headers.get("location")).toBeNull()
    const session = callback.cookies.get(SESSION)!
    expect(session.value).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(session.sameSite).toBe("strict")
    expect(callback.cookies.get(ATTEMPT)?.maxAge).toBe(0)
    expect(callback.cookies.get(BINDING)?.maxAge).toBe(0)
    const cookie = `${SESSION}=${session.value}`
    const response = await f.handlers.session(f.request("/api/iam/session", cookie))
    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toContain("no-store")
    // No subject, principal, tenant, organisation or token reaches the browser.
    const value = await response.json()
    expect(value.authenticated).toBe(true)
    expect(Object.keys(value).sort()).toEqual(["authenticated", "csrfToken", "expiresAt"])
    expect(JSON.stringify([...f.records])).not.toContain("synthetic-private-access-token")
    expect(JSON.stringify([...f.records])).not.toContain("synthetic-discard-refresh")
    expect((await f.handlers.callback(f.request(login.callback, login.cookie))).status).toBe(401)
    // Rechecks happen after login too: a previously valid cookie cannot survive
    // provider revocation or a token that lost its Trade audience or trade:buy.
    f.alter({ inactive: true })
    expect((await f.handlers.session(f.request("/api/iam/session", cookie))).status).toBe(401)
    f.alter({ inactive: false, tokenAudience: "baobab-control-plane" })
    expect((await f.handlers.session(f.request("/api/iam/session", cookie))).status).toBe(401)
    f.alter({ tokenAudience: "baobab-trade", tokenScope: "openid" })
    expect((await f.handlers.session(f.request("/api/iam/session", cookie))).status).toBe(401)
    // Logout must still work during an authority outage, but only with CSRF.
    expect(
      (await f.handlers.logout(f.request("/api/iam/logout", cookie, "POST", "csrfToken=wrong")))
        .status,
    ).toBe(401)
    expect(
      (
        await f.handlers.logout(
          f.request("/api/iam/logout", cookie, "POST", `csrfToken=${value.csrfToken}`),
        )
      ).status,
    ).toBe(303)
    expect(await f.store.readSession(session.value)).toBeNull()
  })
  it.each([
    { claims: { nonce: "wrong" } },
    { claims: { iss: "https://attacker.example.test/" } },
    { claims: { aud: "other-client" } },
    { claims: { exp: 1 } },
    { signatureBad: true },
    { inactive: true },
    { tokenAudience: "baobab-cms" },
    { tokenAudience: "baobab-control-plane" },
    { tokenScope: "openid context:resolve" },
  ])(
    "rejects invalid identity or current authority %j without issuing a session",
    async (change) => {
      const f = fixture(),
        login = await f.login()
      f.alter(change)
      const response = await f.handlers.callback(f.request(login.callback, login.cookie))
      expect(response.status).toBe(401)
      expect(response.cookies.get(SESSION)).toBeUndefined()
      expect((await f.handlers.callback(f.request(login.callback, login.cookie))).status).toBe(401)
      expect(await response.text()).not.toContain("synthetic")
    },
  )
  it.each(["state=wrong&code=x", "error=access_denied", "state=x&state=y&code=z", "code=x"])(
    "burns malformed/error callbacks before token exchange: %s",
    async (query) => {
      const f = fixture(),
        login = await f.login()
      expect(
        (await f.handlers.callback(f.request("/api/iam/callback?" + query, login.cookie))).status,
      ).toBe(401)
      expect((await f.handlers.callback(f.request(login.callback, login.cookie))).status).toBe(401)
      expect(f.fetcher.mock.calls.filter(([u]) => String(u).endsWith("/token"))).toHaveLength(0)
    },
  )
  it("burns a stolen transaction with the wrong browser binding", async () => {
    const f = fixture(),
      login = await f.login()
    const cookie = login.cookie.replace(
      new RegExp(`${BINDING}=[^;]+`),
      `${BINDING}=${"a".repeat(43)}`,
    )
    expect((await f.handlers.callback(f.request(login.callback, cookie))).status).toBe(401)
    expect((await f.handlers.callback(f.request(login.callback, login.cookie))).status).toBe(401)
  })
  it("rejects cross-origin initiation and unsafe discovery before credential exchange", async () => {
    const f = fixture()
    expect(
      (
        await f.handlers.login(
          f.request("/api/iam/login", "", "POST", undefined, "https://attacker.test"),
        )
      ).status,
    ).toBe(401)
    expect(f.fetcher).not.toHaveBeenCalled()
    f.alter({ endpoint: "https://attacker.test/token" })
    expect((await f.handlers.login(f.request("/api/iam/login", "", "POST"))).status).toBe(401)
    expect(f.fetcher).toHaveBeenCalledTimes(1)
  })
  it("caps custody at the current introspection expiry", async () => {
    const f = fixture(),
      login = await f.login()
    f.alter({ tokenLifetime: 120 })
    const response = await f.handlers.callback(f.request(login.callback, login.cookie))
    expect(response.status).toBe(200)
    const session = await f.store.readSession(response.cookies.get(SESSION)!.value)
    expect(session!.expiresAt).toBeLessThanOrEqual(Date.now() + 120000)
    expect(response.cookies.get(SESSION)!.maxAge).toBeLessThanOrEqual(120)
  })
  it("rejects duplicate cookies and rotates a presented old session", async () => {
    const f = fixture(),
      login = await f.login()
    expect(
      (
        await f.handlers.callback(
          f.request(login.callback, `${login.cookie}; ${ATTEMPT}=${"a".repeat(43)}`),
        )
      ).status,
    ).toBe(401)
    const old = await f.store.createSession({
      issuer: settings.issuer,
      subject: "old-provider-subject",
      accessToken: "old-token",
      csrfToken: "a".repeat(43),
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
    })
    const response = await f.handlers.callback(
      f.request(login.callback, `${login.cookie}; ${SESSION}=${old}`),
    )
    expect(response.status).toBe(200)
    expect(await f.store.readSession(old)).toBeNull()
    expect(response.cookies.get(SESSION)?.value).not.toBe(old)
  })
  it.each([undefined, "", "null", "https://untrusted.example.test"])(
    "denies logout with an absent, opaque or foreign Origin even with valid CSRF: %s",
    async (origin) => {
      const f = fixture(),
        login = await f.login()
      const callback = await f.handlers.callback(f.request(login.callback, login.cookie))
      const handle = callback.cookies.get(SESSION)!.value
      const session = (await f.store.readSession(handle))!
      const body = new URLSearchParams({ csrfToken: session.csrfToken }).toString()
      const original = f.request("/api/iam/logout", `${SESSION}=${handle}`, "POST", body)
      const headers = new Headers(original.headers)
      if (origin === undefined) headers.delete("origin")
      else headers.set("origin", origin)
      const response = await f.handlers.logout(
        new NextRequest(original.url, { method: "POST", headers, body }),
      )
      expect(response.status).toBe(401)
      expect(await f.store.readSession(handle)).not.toBeNull()
    },
  )
  it("fails closed when disabled or storage is unavailable", async () => {
    const f = fixture()
    const off = authHandlers({ settings: () => null, store: () => f.store })
    expect((await off.login(f.request("/api/iam/login", "", "POST"))).status).toBe(404)
    const broken = authHandlers({ settings: () => settings, store: () => null })
    expect((await broken.login(f.request("/api/iam/login", "", "POST"))).status).toBe(401)
    expect(f.fetcher).not.toHaveBeenCalled()
  })
})

describe("closed configuration and bounded transport", () => {
  it("requires explicit environment, HTTPS and confidential client configuration", () => {
    expect(readAuthSettings({})).toBeNull()
    expect(() => readAuthSettings({ ZURIBEANS_IAM_BFF_ENABLED: "true" })).toThrow(
      "Authentication unavailable or denied",
    )
    const env = {
      ZURIBEANS_IAM_BFF_ENABLED: "true",
      ZURIBEANS_IAM_ENVIRONMENT: "staging",
      ZURIBEANS_IAM_ORIGIN: settings.origin,
      BAOBAB_IAM_ISSUER: settings.issuer,
      BAOBAB_IAM_AUDIENCE: "baobab-trade",
      BAOBAB_IAM_CLIENT_ID: settings.clientId,
      ZURIBEANS_IAM_CLIENT_SECRET: settings.clientSecret,
      BAOBAB_IAM_INTROSPECTION_ENDPOINT: settings.introspectionEndpoint,
    }
    expect(readAuthSettings(env)).toEqual({ ...settings, trustProxy: false })
    expect(readAuthSettings({ ...env, ZURIBEANS_IAM_TRUST_PROXY: "true" })?.trustProxy).toBe(true)
    expect(() => readAuthSettings({ ...env, ZURIBEANS_IAM_TRUST_PROXY: "yes" })).toThrow()
    for (const change of [
      { ZURIBEANS_IAM_ENVIRONMENT: "production" },
      { ZURIBEANS_IAM_ORIGIN: "http://localhost" },
      { ZURIBEANS_IAM_ORIGIN: "https://estate.example.test/path" },
      { BAOBAB_IAM_INTROSPECTION_ENDPOINT: "https://attacker.test/introspect" },
      { BAOBAB_IAM_AUDIENCE: "baobab-control-plane" },
      { BAOBAB_IAM_AUDIENCE: undefined },
      { ZURIBEANS_IAM_ORIGIN: "https://iam.example.test" },
      { NODE_TLS_REJECT_UNAUTHORIZED: "0" },
    ])
      expect(() => readAuthSettings({ ...env, ...change })).toThrow()
  })
  it("rejects an off-list destination without calling fetch", async () => {
    const fetcher = vi.fn<typeof fetch>()
    await expect(
      credentialFetch([settings.issuer], fetcher)("https://attacker.test"),
    ).rejects.toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
  it("bounds actual bytes and stalled bodies independently of Content-Length", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(65537))
      },
    })
    const fetcher = vi.fn<typeof fetch>(
      async () =>
        new Response(body, {
          headers: { "Content-Type": "application/json", "Content-Length": "1" },
        }),
    )
    await expect(credentialFetch([settings.issuer], fetcher)(settings.issuer)).rejects.toThrow()
    const stalled = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array([1]))
      },
    })
    await expect(limitedBody(stalled, AbortSignal.timeout(20))).rejects.toThrow()
  })
  it.each([
    { active: false },
    { sub: "wrong-subject" },
    { iss: "https://other-issuer.test" },
    { aud: "other-resource" },
    { aud: ["baobab-control-plane", "baobab-erp"] },
    { client_id: "other-client" },
    { exp: 1 },
    { scope: "openid" },
  ])("denies altered introspection: %j", async (altered) => {
    const f = fixture()
    const original = f.fetcher
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      const response = await original(url, init)
      return json({ ...(await response.json()), ...altered })
    })
    await expect(
      requireCurrentIamSession(
        {
          issuer: settings.issuer,
          subject: "provider-subject-not-cp-uuid",
          accessToken: "synthetic-private-access-token",
          csrfToken: "a".repeat(43),
          createdAt: Date.now(),
          expiresAt: Date.now() + 60000,
        },
        settings,
        fetcher,
      ),
    ).rejects.toThrow()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it("does not call IAM for a stale session or wrong issuer", async () => {
    const fetcher = vi.fn<typeof fetch>()
    await expect(
      requireCurrentIamSession(
        {
          issuer: settings.issuer,
          subject: "x",
          accessToken: "x",
          csrfToken: "a".repeat(43),
          createdAt: Date.now() - 2000,
          expiresAt: Date.now() - 1000,
        },
        settings,
        fetcher,
      ),
    ).rejects.toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
})
