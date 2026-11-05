import "server-only"
import { AsyncLocalStorage } from "node:async_hooks"
import { randomBytes } from "node:crypto"

/** Real run-owned BFF server and credentialed client OTLP spans, not log-only trace IDs.
 * A configured Collector receives the standard OTLP/HTTP JSON encoding.
 * IAM, CP and Trade business authority is never derived from traceparent.
 */
const PARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-(0[01])$/
const ZERO = /^0+$/
type Span = {
  traceId: string; spanId: string; parentSpanId?: string; flags: string
  start: string; name: string; kind: 2 | 3
}
const context = new AsyncLocalStorage<Span>()
const id = (bytes: number) => randomBytes(bytes).toString("hex")
const nanos = () => (BigInt(Date.now()) * 1000000n).toString()
const header = (s: Span) => ["00", s.traceId, s.spanId, s.flags].join("-")
const typed = (value: string) => ({ stringValue: value })
const ROLES = new Set(["buyer-context", "iam-session", "iam-login", "iam-callback", "iam-logout"])
type Route = "buyer-context" | "iam-session" | "iam-login" | "iam-callback" | "iam-logout"

export function parseTraceparent(value: string | null): Span | null {
  const m = value === null ? null : PARENT.exec(value)
  if (!m || ZERO.test(m[1]) || ZERO.test(m[2])) return null
  return {
    traceId: m[1], spanId: m[2], flags: m[3],
    start: nanos(), name: "baobab.zuribeans.bff.request", kind: 2,
  }
}

/** Do not mint an unexported child for a downstream header. */
export function outgoingTraceparent(): string | undefined {
  const s = context.getStore()
  return s ? header(s) : undefined
}

function collector(): string | undefined {
  const raw = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    const environment = process.env.BAOBAB_ENVIRONMENT ?? process.env.NODE_ENV ?? "development"
    if ((url.protocol !== "https:" &&
        !(url.protocol === "http:" &&
          ["development", "test", "integration"].includes(environment))) ||
        url.username || url.password || url.search || url.hash ||
        url.pathname !== "/v1/traces") return undefined
    return url.href
  } catch { return undefined }
}
const b64 = (hex: string): string => Buffer.from(hex, "hex").toString("base64")
async function exportSpan(span: Span, status: number, route: string): Promise<void> {
  const url = collector()
  if (!url || span.flags !== "01") return
  if (span.kind === 2 && !ROLES.has(route)) return
  const body = {
    resourceSpans: [{
      resource: { attributes: [
        { key: "service.name", value: typed("zuribeans-bff") },
        { key: "service.namespace", value: typed("baobab") },
      ] },
      scopeSpans: [{
        scope: { name: "baobab.zuribeans.bff", version: "dev11" },
        spans: [{
          traceId: b64(span.traceId), spanId: b64(span.spanId),
          ...(span.parentSpanId ? { parentSpanId: b64(span.parentSpanId) } : {}),
          name: span.name, kind: span.kind,
          startTimeUnixNano: span.start, endTimeUnixNano: nanos(),
          attributes: [
            { key: "baobab.route", value: typed(route) },
            { key: "http.response.status_class", value: typed(
              status >= 500 ? "5xx" : status >= 400 ? "4xx" :
              status >= 300 ? "3xx" : status >= 200 ? "2xx" : "OTHER",
            ) },
          ],
          status: { code: status >= 500 ? 2 : 1 },
        }],
      }],
    }],
  }
  try {
    // Telemetry does not transport any credentials, PII, URLs, request bodies,
    // raw error messages, tenant or subject identifiers.
    await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), redirect: "error", cache: "no-store",
      signal: AbortSignal.timeout(1000),
    })
  } catch {
    // Missing OTLP evidence blocks independent L4; never changes grants.
  }
}

/** An actual credentialed IAM/Trade HTTP operation owns a real CLIENT span. */
export async function withBffCredentialedHttpSpan<T>(
  action: (traceparent: string | undefined) => Promise<T>,
): Promise<T> {
  const parent = context.getStore()
  if (!parent) return action(undefined)
  const child: Span = {
    traceId: parent.traceId, spanId: id(8), parentSpanId: parent.spanId,
    flags: parent.flags, start: nanos(),
    name: "baobab.zuribeans.bff.credentialed_http", kind: 3,
  }
  return context.run(child, async () => {
    let status = 503
    try {
      const result = await action(header(child))
      // A real IAM/Trade 403/503 cannot be exported as a fabricated HTTP 200.
      status = result instanceof Response ? result.status : 200
      return result
    } finally {
      await exportSpan(child, status, "credentialed_http")
    }
  })
}

/** Actual confidential request boundary, including IAM/CP denials. */
export async function withBffTrace(
  request: Request,
  route: Route,
  handler: () => Promise<Response>,
): Promise<Response> {
  if (!ROLES.has(route)) throw new Error("DEV11_BFF_ROUTE_NOT_APPROVED")
  const incoming = parseTraceparent(request.headers.get("traceparent"))
  const span: Span = {
    traceId: incoming?.traceId ?? id(16),
    parentSpanId: incoming?.spanId,
    spanId: id(8), flags: incoming?.flags ?? "01",
    start: nanos(), name: "baobab.zuribeans.bff.request", kind: 2,
  }
  return context.run(span, async () => {
    let status = 500
    let cause: "NONE" | "UNHANDLED_EXCEPTION" = "UNHANDLED_EXCEPTION"
    try {
      const response = await handler()
      status = response.status
      cause = "NONE"
      response.headers.set("traceparent", header(span))
      return response
    } finally {
      await exportSpan(span, status, route)
      console.info("bff request completed", {
        route, status, cause, trace_id: span.traceId,
        span_id: span.spanId, parent_span_id: span.parentSpanId ?? "",
      })
    }
  })
}
