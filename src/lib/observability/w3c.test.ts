// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import { outgoingTraceparent, parseTraceparent, withBffTrace } from "./w3c"

afterEach(() => vi.restoreAllMocks())

describe("DEV-11 native confidential BFF W3C runtime path", () => {
  it("creates a real child for downstream IAM/Trade requests", async () => {
    const output = vi.spyOn(console, "info").mockImplementation(() => {})
    const incoming = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"
    let downstream: string | undefined
    const result = await withBffTrace(
      new Request("https://zuribeans.example.test/api/buyer/context", {
        method: "POST",
        headers: { traceparent: incoming, authorization: "Bearer secret-private" },
      }),
      "buyer-context",
      async () => {
        downstream = outgoingTraceparent()
        return new Response(null, { status: 403 })
      },
    )
    const server = parseTraceparent(result.headers.get("traceparent"))
    const client = parseTraceparent(downstream ?? null)
    expect(result.status).toBe(403)
    expect(server?.traceId).toBe("4bf92f3577b34da6a3ce929d0e0e4736")
    expect(client?.traceId).toBe(server?.traceId)
    expect(client?.spanId).not.toBe(server?.spanId)
    expect(server?.spanId).not.toBe("00f067aa0ba902b7")
    expect(JSON.stringify(output.mock.calls)).not.toContain("secret-private")
    expect(JSON.stringify(output.mock.calls)).not.toContain("/api/buyer/context")
    expect(outgoingTraceparent()).toBeUndefined()
  })

  it("creates an independent root for invalid trace context without granting access", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {})
    const invalid = "00-" + "0".repeat(32) + "-00f067aa0ba902b7-01"
    const result = await withBffTrace(
      new Request("https://zuribeans.example.test/api/iam/session", {
        headers: { traceparent: invalid, authorization: "Bearer another-secret" },
      }),
      "iam-session",
      async () => Response.json({ code: "AUTHENTICATION_UNAVAILABLE_OR_DENIED" }, { status: 401 }),
    )
    expect(result.status).toBe(401)
    expect(parseTraceparent(result.headers.get("traceparent"))?.traceId).not.toBe("0".repeat(32))
  })

  it("is strictly request-scoped across concurrent real operations", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {})
    const calls = await Promise.all(
      Array.from({ length: 8 }, () =>
        withBffTrace(
          new Request("https://zuribeans.example.test/api/iam/session"),
          "iam-session",
          async () => {
            const before = outgoingTraceparent()
            await Promise.resolve()
            const after = outgoingTraceparent()
            expect(parseTraceparent(before ?? null)?.traceId).toBe(
              parseTraceparent(after ?? null)?.traceId,
            )
            return new Response(null, { status: 204 })
          },
        ),
      ),
    )
    const ids = calls.map((result) => parseTraceparent(result.headers.get("traceparent"))?.traceId)
    expect(new Set(ids).size).toBe(8)
  })
})
