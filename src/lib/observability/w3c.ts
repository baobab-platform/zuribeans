import "server-only"
import { AsyncLocalStorage } from "node:async_hooks"
import { randomBytes } from "node:crypto"

const PARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/
const ZERO = /^0+$/
type Span = {
  traceId: string
  spanId: string
  parentSpanId?: string
  flags: string
}
const context = new AsyncLocalStorage<Span>()

const id = (bytes: number): string => randomBytes(bytes).toString("hex")
const header = (span: Span): string => `00-${span.traceId}-${span.spanId}-${span.flags}`

/** Trace IDs are untrusted diagnostics, never tenant, subject or grant evidence. */
export function parseTraceparent(value: string | null): Span | null {
  const match = value === null ? null : PARENT.exec(value)
  if (!match || ZERO.test(match[1]) || ZERO.test(match[2])) return null
  return { traceId: match[1], spanId: match[2], flags: match[3] }
}

/** A new span for an actual outgoing TLS HTTP operation. */
export function outgoingTraceparent(): string | undefined {
  const current = context.getStore()
  if (!current) return undefined
  return header({ traceId: current.traceId, spanId: id(8), flags: current.flags })
}

/** Real protected Node BFF request boundary, including IAM/CP denials.
 * No OAuth state/cookie/authorization, user identifiers or arbitrary URL are logged.
 */
export async function withBffTrace(
  request: Request,
  route: "buyer-context" | "iam-session" | "iam-login" | "iam-callback" | "iam-logout",
  handler: () => Promise<Response>,
): Promise<Response> {
  const incoming = parseTraceparent(request.headers.get("traceparent"))
  const span: Span = {
    traceId: incoming?.traceId ?? id(16),
    parentSpanId: incoming?.spanId,
    spanId: id(8),
    flags: incoming?.flags ?? "01",
  }
  return context.run(span, async () => {
    const response = await handler()
    // Server-generated traceparent is diagnostic and cannot affect BFF grants.
    response.headers.set("traceparent", header(span))
    // Bounded route name and status only; no input header, tokens, body or URL.
    console.info("bff request completed", {
      route,
      status: response.status,
      trace_id: span.traceId,
      span_id: span.spanId,
      parent_span_id: span.parentSpanId ?? "",
    })
    return response
  })
}
