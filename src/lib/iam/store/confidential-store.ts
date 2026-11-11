import "server-only"
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"
import { z } from "zod"

/**
 * ZB-G03 confidential BFF storage (adapted from Nabhold G04B-02), not an
 * identity or authorisation service.
 * Browser values are random handles. Redis receives only hashed handles and
 * authenticated ciphertext; issuer+subject remains external identity evidence,
 * never a CP Principal, Tenant membership or an executive permission.
 *
 * GETDEL atomically burns login transactions across instances before browser
 * binding validation. A wrong browser, corrupt record or uncertain transport
 * result cannot restore/retry a transaction. Reads do not renew session TTL;
 * local revocation must complete before a future logout route reports success.
 * IAM introspection/revocation and current CP/domain authority still have to be
 * checked on every protected operation (IAM ADR-0010 section 0).
 */
export class ConfidentialStoreError extends Error {
  constructor() {
    super("Confidential session storage unavailable or invalid")
    this.name = "ConfidentialStoreError"
  }
}
export interface ConfidentialBackend {
  /** No buffering, retries, plaintext fallback or logging of arguments/replies. */
  execute(args: readonly string[]): Promise<unknown>
}
export const newOpaqueHandle = () => randomBytes(32).toString("base64url")
const HANDLE = /^[A-Za-z0-9_-]{43}$(?![\s\S])/
const ID = /^[a-z][a-z0-9-]{0,31}$(?![\s\S])/
const boundedTime = z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
const secret = z.string().min(1).max(16384)
const secureURL = z
  .string()
  .url()
  .refine((s) => {
    const u = new URL(s)
    return u.protocol === "https:" && !u.username && !u.password && !u.search && !u.hash
  })
const transactionSchema = z
  .object({
    issuer: secureURL,
    clientId: z.string().min(1).max(256),
    redirectUri: secureURL,
    scopes: z
      .array(z.enum(["openid", "trade:buy"]))
      .length(2)
      .refine(
        (v) => v.includes("openid") && v.includes("trade:buy") && new Set(v).size === v.length,
      ),
    state: z.string().regex(HANDLE),
    nonce: z.string().regex(HANDLE),
    codeVerifier: z.string().regex(HANDLE),
    createdAt: boundedTime,
    expiresAt: boundedTime,
  })
  .strict()
const retainedTransactionSchema = transactionSchema.extend({
  browserBindingDigest: z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/),
})
const sessionSchema = z
  .object({
    issuer: secureURL,
    subject: z.string().min(1).max(256),
    accessToken: secret,
    csrfToken: z.string().regex(HANDLE),
    createdAt: boundedTime,
    expiresAt: boundedTime,
  })
  .strict()
export type LoginTransaction = z.infer<typeof transactionSchema>
/** Private server credential; never serialize this record to a browser. */
export type ConfidentialSession = z.infer<typeof sessionSchema>
export interface StoreKeyring {
  active: string
  keys: Readonly<Record<string, Buffer>>
}

const digest = (s: string) => createHash("sha256").update(s).digest("hex")
const encoded = z
  .string()
  .max(90000)
  .regex(/^[A-Za-z0-9_-]+$(?![\s\S])/)
const envelopeSchema = z
  .object({
    v: z.literal(1),
    kid: z.string().regex(ID),
    nonce: encoded,
    tag: encoded,
    ciphertext: encoded,
  })
  .strict()

export class ConfidentialSessionStore {
  private readonly keys: Record<string, Buffer>
  private readonly active: string
  constructor(
    private readonly backend: ConfidentialBackend,
    keyring: StoreKeyring,
    private readonly recoveryEpoch: string,
    private readonly now: () => number = Date.now,
  ) {
    try {
      if (
        !ID.test(recoveryEpoch) ||
        !ID.test(keyring.active) ||
        !Object.hasOwn(keyring.keys, keyring.active) ||
        Object.keys(keyring.keys).length < 1 ||
        Object.keys(keyring.keys).length > 3
      )
        throw new Error()
      this.keys = Object.fromEntries(
        Object.entries(keyring.keys).map(([id, bytes]) => {
          if (!ID.test(id) || !Buffer.isBuffer(bytes) || bytes.length !== 32) throw new Error()
          // Copy caller buffers: rotating/mutating configuration outside this
          // store must not silently change the key used for an in-flight record.
          return [id, Buffer.from(bytes)]
        }),
      )
      this.active = keyring.active
    } catch {
      throw new ConfidentialStoreError()
    }
  }
  private storageKey(kind: "login" | "session", handle: string): string {
    if (!HANDLE.test(handle)) throw new ConfidentialStoreError()
    return `zuribeans:bff:v1:${this.recoveryEpoch}:${kind}:${digest(handle)}`
  }
  private seal(key: string, value: unknown): string {
    const plain = Buffer.from(JSON.stringify(value))
    if (plain.length > 32768) throw new ConfidentialStoreError()
    const nonce = randomBytes(12)
    const cipher = createCipheriv("aes-256-gcm", this.keys[this.active], nonce)
    // Bind key ID, version, recovery epoch, record type and hashed handle.
    // Moving ciphertext between records/types/epochs must fail authentication.
    cipher.setAAD(Buffer.from(`${key}:1:${this.active}`))
    const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()])
    return JSON.stringify({
      v: 1,
      kid: this.active,
      nonce: nonce.toString("base64url"),
      tag: cipher.getAuthTag().toString("base64url"),
      ciphertext: ciphertext.toString("base64url"),
    })
  }
  private open(key: string, text: unknown): unknown {
    if (typeof text !== "string" || Buffer.byteLength(text) > 65536)
      throw new ConfidentialStoreError()
    const e = envelopeSchema.parse(JSON.parse(text))
    if (!Object.hasOwn(this.keys, e.kid)) throw new ConfidentialStoreError()
    const nonce = Buffer.from(e.nonce, "base64url"),
      tag = Buffer.from(e.tag, "base64url")
    if (nonce.length !== 12 || tag.length !== 16) throw new ConfidentialStoreError()
    const decipher = createDecipheriv("aes-256-gcm", this.keys[e.kid], nonce)
    decipher.setAAD(Buffer.from(`${key}:1:${e.kid}`))
    decipher.setAuthTag(tag)
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        Buffer.concat([decipher.update(Buffer.from(e.ciphertext, "base64url")), decipher.final()]),
      ),
    )
  }
  private ttl(value: { createdAt: number; expiresAt: number }, maximum: number): number {
    const time = this.now()
    if (
      !Number.isSafeInteger(time) ||
      time < value.createdAt ||
      value.expiresAt <= time ||
      value.expiresAt - value.createdAt > maximum
    )
      throw new ConfidentialStoreError()
    return value.expiresAt - time
  }
  private async issue<T extends { createdAt: number; expiresAt: number }>(
    kind: "login" | "session",
    value: T,
    maximum: number,
  ): Promise<string> {
    this.ttl(value, maximum)
    const handle = newOpaqueHandle(),
      key = this.storageKey(kind, handle)
    // Absolute PXAT expiry does not extend retention by connection latency.
    // NX prevents overwriting even an astronomically unlikely handle collision.
    // An uncertain SET is never replayed: an orphan expires by its original TTL.
    if (
      (await this.backend.execute([
        "SET",
        key,
        this.seal(key, value),
        "NX",
        "PXAT",
        String(value.expiresAt),
      ])) !== "OK"
    )
      throw new ConfidentialStoreError()
    return handle
  }
  async issueLogin(input: LoginTransaction, browserBinding: string): Promise<string> {
    try {
      if (!HANDLE.test(browserBinding)) throw new Error()
      const value = transactionSchema.parse(input)
      return await this.issue(
        "login",
        { ...value, browserBindingDigest: digest(browserBinding) },
        300000,
      )
    } catch {
      throw new ConfidentialStoreError()
    }
  }
  async consumeLogin(handle: string, browserBinding: string): Promise<LoginTransaction | null> {
    try {
      if (!HANDLE.test(browserBinding)) throw new Error()
      const key = this.storageKey("login", handle)
      const raw = await this.backend.execute(["GETDEL", key])
      if (raw === null) return null
      const value = retainedTransactionSchema.parse(this.open(key, raw))
      this.ttl(value, 300000)
      if (
        !timingSafeEqual(
          Buffer.from(value.browserBindingDigest, "hex"),
          Buffer.from(digest(browserBinding), "hex"),
        )
      )
        throw new Error()
      // The browser binding is custody metadata; the callback receives the
      // original retained state/nonce/verifier/issuer/client/redirect tuple.
      return transactionSchema.parse({
        issuer: value.issuer,
        clientId: value.clientId,
        redirectUri: value.redirectUri,
        scopes: value.scopes,
        state: value.state,
        nonce: value.nonce,
        codeVerifier: value.codeVerifier,
        createdAt: value.createdAt,
        expiresAt: value.expiresAt,
      })
    } catch {
      throw new ConfidentialStoreError()
    }
  }
  async createSession(input: ConfidentialSession): Promise<string> {
    try {
      return await this.issue("session", sessionSchema.parse(input), 3600000)
    } catch {
      throw new ConfidentialStoreError()
    }
  }
  async readSession(handle: string): Promise<ConfidentialSession | null> {
    try {
      const key = this.storageKey("session", handle),
        raw = await this.backend.execute(["GET", key])
      if (raw === null) return null
      const value = sessionSchema.parse(this.open(key, raw))
      this.ttl(value, 3600000)
      return value
    } catch {
      throw new ConfidentialStoreError()
    }
  }
  async revokeSession(handle: string): Promise<void> {
    try {
      const result = await this.backend.execute(["DEL", this.storageKey("session", handle)])
      if (result !== 0 && result !== 1) throw new Error()
    } catch {
      throw new ConfidentialStoreError()
    }
  }
}
