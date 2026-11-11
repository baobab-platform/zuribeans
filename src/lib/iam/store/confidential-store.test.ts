// @vitest-environment node
import { randomBytes } from "node:crypto"
import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import {
  ConfidentialSessionStore,
  ConfidentialStoreError,
  newOpaqueHandle,
  type ConfidentialBackend,
  type LoginTransaction,
} from "./confidential-store"
import { createConfidentialStoreFromEnv, TlsRedisBackend } from "./redis-backend"

// This backend is a crypto/validation unit fixture only. Atomicity, actual TTL,
// ACL and TLS are separately exercised against real Redis in the required CI
// integration step. These records never assert a real ZuriBeans login/Principal.
const now = 1800000000000
const pending = (): LoginTransaction => ({
  issuer: "https://iam.example.test/",
  clientId: "reviewed-fixture-client",
  redirectUri: "https://estate.example.test/api/iam/callback",
  scopes: ["openid", "trade:buy"],
  state: newOpaqueHandle(),
  nonce: newOpaqueHandle(),
  codeVerifier: newOpaqueHandle(),
  createdAt: now,
  expiresAt: now + 300000,
})
const session = () => ({
  issuer: "https://iam.example.test/",
  subject: "external-subject-fixture",
  accessToken: "private-access-token-fixture",
  csrfToken: newOpaqueHandle(),
  createdAt: now,
  expiresAt: now + 60000,
})
function fixture() {
  const records = new Map<string, string>()
  const execute = vi.fn<ConfidentialBackend["execute"]>(async ([op, key, value]) => {
    if (op === "SET") {
      if (records.has(key)) return null
      records.set(key, value)
      return "OK"
    }
    if (op === "DEL") return records.delete(key) ? 1 : 0
    const raw = records.get(key) ?? null
    if (op === "GETDEL") records.delete(key)
    return raw
  })
  const keyring = { active: "key-a", keys: { "key-a": randomBytes(32) } }
  return {
    records,
    execute,
    keyring,
    store: new ConfidentialSessionStore({ execute }, keyring, "epoch-a", () => now),
  }
}

describe("confidential BFF storage boundaries", () => {
  it("keeps handles, verifier, subject and tokens out of Redis plaintext and preserves records", async () => {
    const f = fixture(),
      value = session()
    const handle = await f.store.createSession(value)
    expect(handle).toMatch(/^[A-Za-z0-9_-]{43}$/)
    const text = JSON.stringify([...f.records])
    for (const secret of [handle, value.accessToken, value.subject, value.csrfToken])
      expect(text).not.toContain(secret)
    expect(await f.store.readSession(handle)).toEqual(value)
    expect(f.execute.mock.calls[0][0].slice(3)).toEqual(["NX", "PXAT", String(now + 60000)])
  })
  it("burns login before binding validation and never permits a second consume", async () => {
    const f = fixture(),
      browser = newOpaqueHandle(),
      value = pending()
    const handle = await f.store.issueLogin(value, browser)
    expect(await f.store.consumeLogin(handle, browser)).toEqual(value)
    expect(await f.store.consumeLogin(handle, browser)).toBeNull()
    const wrong = await f.store.issueLogin(value, browser)
    await expect(f.store.consumeLogin(wrong, newOpaqueHandle())).rejects.toThrow(
      ConfidentialStoreError,
    )
    expect(await f.store.consumeLogin(wrong, browser)).toBeNull()
    expect(JSON.stringify([...f.records])).not.toContain(value.codeVerifier)
  })
  it("does not slide expiry and refuses expired records or reversed clocks", async () => {
    const f = fixture(),
      handle = await f.store.createSession(session())
    for (const time of [now - 1, now + 60000]) {
      const reader = new ConfidentialSessionStore(
        { execute: f.execute },
        f.keyring,
        "epoch-a",
        () => time,
      )
      await expect(reader.readSession(handle)).rejects.toThrow(ConfidentialStoreError)
    }
    expect(f.execute.mock.calls.filter(([args]) => args[0] === "SET")).toHaveLength(1)
  })
  it.each([0, 3600001])("rejects invalid session lifetime %s before storage", async (duration) => {
    const f = fixture()
    await expect(
      f.store.createSession({ ...session(), expiresAt: now + duration }),
    ).rejects.toThrow(ConfidentialStoreError)
    expect(f.execute).not.toHaveBeenCalled()
  })
  it("rejects unexpected authority fields and malformed handles before Redis access", async () => {
    const f = fixture()
    await expect(
      f.store.createSession({ ...session(), roles: ["administrator"] } as unknown as ReturnType<
        typeof session
      >),
    ).rejects.toThrow(ConfidentialStoreError)
    await expect(f.store.readSession(`${newOpaqueHandle()}\n`)).rejects.toThrow(
      ConfidentialStoreError,
    )
    expect(f.execute).not.toHaveBeenCalled()
  })
  it("binds ciphertext to its record and rejects tampering, oversize and unknown keys", async () => {
    for (const change of ["move", "tag", "key", "oversize"]) {
      const f = fixture(),
        one = await f.store.createSession(session()),
        two = await f.store.createSession(session())
      const keys = [...f.records.keys()]
      if (change === "move") f.records.set(keys[1], f.records.get(keys[0])!)
      if (change === "oversize") f.records.set(keys[1], "x".repeat(65537))
      if (change === "tag" || change === "key") {
        const envelope = JSON.parse(f.records.get(keys[1])!)
        if (change === "tag") envelope.tag = randomBytes(16).toString("base64url")
        else envelope.kid = "unknown-key"
        f.records.set(keys[1], JSON.stringify(envelope))
      }
      await expect(f.store.readSession(two)).rejects.toThrow(ConfidentialStoreError)
      expect(await f.store.readSession(one)).not.toBeNull()
    }
  })
  it("supports bounded key rotation and fences restored data with a new recovery epoch", async () => {
    const f = fixture(),
      old = await f.store.createSession(session())
    const rotated = { active: "key-b", keys: { ...f.keyring.keys, "key-b": randomBytes(32) } }
    const reader = new ConfidentialSessionStore(
      { execute: f.execute },
      rotated,
      "epoch-a",
      () => now,
    )
    expect(await reader.readSession(old)).not.toBeNull()
    const fresh = await reader.createSession(session())
    expect([...f.records.values()].map((s) => JSON.parse(s).kid)).toEqual(["key-a", "key-b"])
    const removed = new ConfidentialSessionStore(
      { execute: f.execute },
      { active: "key-b", keys: { "key-b": rotated.keys["key-b"] } },
      "epoch-a",
      () => now,
    )
    await expect(removed.readSession(old)).rejects.toThrow(ConfidentialStoreError)
    expect(await removed.readSession(fresh)).not.toBeNull()
    const recovered = new ConfidentialSessionStore(
      { execute: f.execute },
      rotated,
      "epoch-b",
      () => now,
    )
    expect(await recovered.readSession(fresh)).toBeNull()
  })
  it("copies key buffers and revokes a session across readers", async () => {
    const f = fixture(),
      reader = new ConfidentialSessionStore({ execute: f.execute }, f.keyring, "epoch-a", () => now)
    const handle = await f.store.createSession(session())
    f.keyring.keys["key-a"].fill(0)
    expect(await reader.readSession(handle)).not.toBeNull()
    await reader.revokeSession(handle)
    expect(await f.store.readSession(handle)).toBeNull()
    await f.store.revokeSession(handle) // Idempotent local logout.
  })
  it("does not retry or expose errors after uncertain storage operations", async () => {
    const execute = vi.fn(async () => {
      throw new Error("private-host-password-token")
    })
    const store = new ConfidentialSessionStore(
      { execute },
      { active: "key-a", keys: { "key-a": randomBytes(32) } },
      "epoch-a",
      () => now,
    )
    const error = await store
      .consumeLogin(newOpaqueHandle(), newOpaqueHandle())
      .catch((e: Error) => e)
    expect(error).toBeInstanceOf(ConfidentialStoreError)
    expect((error as Error).cause).toBeUndefined()
    expect(String(error)).not.toContain("private-")
    expect(execute).toHaveBeenCalledOnce()
  })
  it("defaults off and refuses invalid enabled or plaintext transport configuration", () => {
    expect(createConfidentialStoreFromEnv({})).toBeNull()
    expect(() => createConfidentialStoreFromEnv({ ZURIBEANS_BFF_STORE_ENABLED: "true" })).toThrow(
      ConfidentialStoreError,
    )
    expect(
      () =>
        new TlsRedisBackend({
          host: "redis://private:password@host",
          port: 6379,
          username: "user",
          password: "secret",
        }),
    ).toThrow(ConfidentialStoreError)
  })
})
