import "server-only"
import { AuthenticationDenied, secureUrl } from "./settings"

/** Count decoded bytes through completion, including peers that stall after headers.
 * Cancellation is fire-and-forget: an uncooperative peer cannot delay cleanup.
 */
export async function limitedBody(
  body: ReadableStream<Uint8Array> | null,
  signal: AbortSignal,
  limit = 65536,
): Promise<Uint8Array> {
  if (!body) throw new AuthenticationDenied()
  const reader = body.getReader()
  let abort: (() => void) | undefined
  const deadline = new Promise<never>((_, reject) => {
    abort = () => {
      void reader.cancel().catch(() => undefined)
      reject(new AuthenticationDenied())
    }
    signal.addEventListener("abort", abort, { once: true })
    if (signal.aborted) abort()
  })
  try {
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const part = await Promise.race([reader.read(), deadline])
      if (part.done) break
      length += part.value.byteLength
      if (length > limit) throw new AuthenticationDenied()
      chunks.push(part.value)
    }
    signal.throwIfAborted()
    return Buffer.concat(chunks, length)
  } finally {
    if (abort) signal.removeEventListener("abort", abort)
    void reader.cancel().catch(() => undefined)
  }
}
/** Exact endpoint allowlist applies before any credential is obtained or sent.
 * openid-client uses this same bounded transport for token exchange and JWKS;
 * redirects, cache reuse, retries and arbitrary metadata endpoints are forbidden.
 */
export function credentialFetch(
  endpoints: readonly string[],
  fetcher: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    try {
      const url = secureUrl(String(input)).href
      if (!endpoints.includes(url) || process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0")
        throw new Error()
      const signal = AbortSignal.any([
        AbortSignal.timeout(5000),
        ...(init?.signal ? [init.signal] : []),
      ])
      const response = await fetcher(url, { ...init, cache: "no-store", redirect: "error", signal })
      if (
        !response.ok ||
        !/^application\/(?:json|jwk-set\+json)(?:;|$)/i.test(
          response.headers.get("content-type") ?? "",
        )
      )
        throw new Error()
      const bytes = await limitedBody(response.body, signal)
      // Preserve no response headers that could expose provider cookies. The
      // OAuth library sees the exact bounded JSON bytes for its own validation.
      return new Response(Buffer.from(bytes), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      throw new AuthenticationDenied()
    }
  }
}
export async function fetchJson(
  url: string,
  init: RequestInit,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  try {
    const response = await credentialFetch([url], fetcher)(url, init)
    return JSON.parse(await response.text())
  } catch {
    throw new AuthenticationDenied()
  }
}
