import "server-only"
import { createClient } from "@redis/client"
import { z } from "zod"
import {
  ConfidentialSessionStore,
  ConfidentialStoreError,
  type ConfidentialBackend,
} from "./confidential-store"

const settingsSchema = z
  .object({
    host: z
      .string()
      .min(1)
      .max(253)
      .regex(/^[a-zA-Z0-9.-]+$(?![\s\S])/),
    port: z.number().int().min(1).max(65535),
    username: z.string().min(1).max(256),
    password: z.string().min(1).max(4096),
    ca: z.string().min(1).max(16384).optional(),
  })
  .strict()
export type RedisSettings = z.infer<typeof settingsSchema>

/**
 * Official node-redis protocol implementation, verified TLS only. One bounded
 * connection per operation avoids stale pools/reconnect replay during failover.
 * No offline command queue or automatic retry is allowed for one-time GETDEL.
 * A timeout destroys the connection; callers start a new login rather than
 * retrying an uncertain consume. The deployment supplies a least-privilege ACL
 * restricted to zuribeans:bff:v1:<epoch>:* and SET/GET/GETDEL/DEL plus handshake.
 */
export class TlsRedisBackend implements ConfidentialBackend {
  private readonly settings: RedisSettings
  constructor(settings: RedisSettings) {
    try {
      this.settings = settingsSchema.parse(settings)
    } catch {
      throw new ConfidentialStoreError()
    }
  }
  async execute(args: readonly string[]): Promise<unknown> {
    if (
      process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0" ||
      !["SET", "GET", "GETDEL", "DEL"].includes(args[0])
    )
      throw new ConfidentialStoreError()
    const s = this.settings
    const client = createClient({
      username: s.username,
      password: s.password,
      disableOfflineQueue: true,
      socket: {
        host: s.host,
        port: s.port,
        tls: true,
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
        servername: s.host,
        ...(s.ca ? { ca: s.ca } : {}),
        connectTimeout: 3000,
        reconnectStrategy: false,
      },
    })
    // node-redis requires an error listener. Never expose a connection error:
    // it can contain hostnames, credentials, command arguments or ciphertext.
    client.on("error", () => undefined)
    const signal = AbortSignal.timeout(3000)
    // Pinned node-redis registers metrics at construction, even when connect
    // fails before opening a socket. isOpen is not a resource-lifetime guard:
    // always destroy to unregister those handles too. destroy is idempotent.
    const stop = () => {
      client.destroy()
    }
    let abort: (() => void) | undefined
    const deadline = new Promise<never>((_, reject) => {
      abort = () => {
        stop()
        reject(new ConfidentialStoreError())
      }
      signal.addEventListener("abort", abort, { once: true })
    })
    try {
      await Promise.race([client.connect(), deadline])
      return await Promise.race([client.sendCommand([...args], { abortSignal: signal }), deadline])
    } catch {
      throw new ConfidentialStoreError()
    } finally {
      if (abort) signal.removeEventListener("abort", abort)
      stop()
    }
  }
}

/** Disabled by default; malformed enabled configuration never falls back. */
export function createConfidentialStoreFromEnv(
  source: Record<string, string | undefined> = process.env,
): ConfidentialSessionStore | null {
  if (source.ZURIBEANS_BFF_STORE_ENABLED !== "true") return null
  try {
    const raw: unknown = JSON.parse(source.ZURIBEANS_BFF_STORE_KEYS_JSON ?? "")
    const keyStrings = z
      .record(
        z.string().regex(/^[a-z][a-z0-9-]{0,31}$(?![\s\S])/),
        z.string().regex(/^[A-Za-z0-9+/]{43}=$(?![\s\S])/),
      )
      .parse(raw)
    const keys = Object.fromEntries(
      Object.entries(keyStrings).map(([id, text]) => {
        const key = Buffer.from(text, "base64")
        if (key.length !== 32 || key.toString("base64") !== text) throw new Error()
        return [id, key]
      }),
    )
    const backend = new TlsRedisBackend({
      host: source.ZURIBEANS_BFF_REDIS_HOST ?? "",
      port: Number(source.ZURIBEANS_BFF_REDIS_PORT),
      username: source.ZURIBEANS_BFF_REDIS_USERNAME ?? "",
      password: source.ZURIBEANS_BFF_REDIS_PASSWORD ?? "",
      ...(source.ZURIBEANS_BFF_REDIS_CA_PEM ? { ca: source.ZURIBEANS_BFF_REDIS_CA_PEM } : {}),
    })
    return new ConfidentialSessionStore(
      backend,
      { active: source.ZURIBEANS_BFF_STORE_ACTIVE_KEY ?? "", keys },
      source.ZURIBEANS_BFF_STORE_EPOCH ?? "",
    )
  } catch {
    throw new ConfidentialStoreError()
  }
}
