// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
import {
  outgoingTraceparent,
  parseTraceparent,
  withBffTrace,
  withBffCredentialedHttpSpan,
} from "./w3c"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

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
        downstream = await withBffCredentialedHttpSpan(async (propagated) => {
          expect(propagated).toBe(outgoingTraceparent())
          return propagated
        })
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

  it("exports the real BFF server and client spans with matching W3C ancestry", async () => {
    const original = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = "http://otel-collector:4318/v1/traces"
    const spans: Array<Record<string, unknown>> = []
    const exporter = vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      const message = JSON.parse(String(init?.body))
      expect(message.resourceSpans[0].resource.attributes[0].value.stringValue).toBe(
        "zuribeans-bff",
      )
      spans.push(message.resourceSpans[0].scopeSpans[0].spans[0])
      return new Response(null, { status: 200 })
    })
    try {
      const result = await withBffTrace(
        new Request("https://zuribeans.test/api/buyer/context", {
          headers: {
            traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-03",
          },
        }),
        "buyer-context",
        async () => {
          await withBffCredentialedHttpSpan(async () => new Response(null, { status: 403 }))
          return new Response(null, { status: 403 })
        },
      )
      expect(result.status).toBe(403)
      expect(exporter).toHaveBeenCalledTimes(2)
      const server = spans.find((s) => s.kind === 2)!
      const client = spans.find((s) => s.kind === 3)!
      expect(server).toBeDefined()
      expect(client).toBeDefined()
      expect(server.traceId).toBe("4bf92f3577b34da6a3ce929d0e0e4736")
      expect(server.parentSpanId).toBe("00f067aa0ba902b7")
      expect(server.spanId).toMatch(/^[0-9a-f]{16}$/)
      expect(client.spanId).toMatch(/^[0-9a-f]{16}$/)
      expect(client.traceId).toBe(server.traceId)
      expect(client.parentSpanId).toBe(server.spanId)
      expect(result.headers.get("traceparent")).toMatch(/-03$/)
      expect(client.status).toEqual({ code: 2 })
      expect(server.status).toEqual({ code: 0 })
      expect(JSON.stringify(spans)).not.toContain("/api/buyer/context")
      expect(JSON.stringify(spans)).not.toContain("Bearer")
      vi.stubEnv("BAOBAB_DEPLOYMENT_ENV", "staging")
      await withBffTrace(
        new Request("https://zuribeans.test"),
        "buyer-context",
        async () => new Response(null, { status: 204 }),
      )
      expect(exporter).toHaveBeenCalledTimes(2)
    } finally {
      if (original === undefined) delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
      else process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = original
    }
  })

  it("bounds pending exports without delaying the real response", async () => {
    vi.stubEnv("ZURIBEANS_IAM_ENVIRONMENT", "development")
    vi.stubEnv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "http://otel-collector:4318/v1/traces")
    vi.spyOn(console, "info").mockImplementation(() => {})
    let finishExport: (value: Response) => void = () => {}
    const pending = new Promise<Response>((resolve) => {
      finishExport = resolve
    })
    const exporter = vi.spyOn(globalThis, "fetch").mockReturnValue(pending)
    try {
      const responses = await Promise.all(
        Array.from({ length: 40 }, () =>
          withBffTrace(
            new Request("https://zuribeans.test/api/buyer/context"),
            "buyer-context",
            async () => new Response(null, { status: 403 }),
          ),
        ),
      )
      expect(responses.every((response) => response.status === 403)).toBe(true)
      expect(exporter).toHaveBeenCalledTimes(32)
    } finally {
      finishExport(new Response(null, { status: 200 }))
      await pending
    }
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

  it("diagnoses thrown native transport failure without leaking exception secrets", async () => {
    const logs = vi.spyOn(console, "info").mockImplementation(() => {})
    const failure = new Error("TOKEN_SECRET_SHOULD_NOT_ESCAPE")
    await expect(
      withBffTrace(
        new Request("https://zuribeans.example.test/api/buyer/context?secret=private", {
          method: "POST",
          headers: { authorization: "Bearer private-credential" },
        }),
        "buyer-context",
        async () => {
          expect(parseTraceparent(outgoingTraceparent() ?? null)).not.toBeNull()
          throw failure
        },
      ),
    ).rejects.toBe(failure)
    const rendered = JSON.stringify(logs.mock.calls)
    expect(rendered).toContain("UNHANDLED_EXCEPTION")
    expect(rendered).not.toContain("TOKEN_SECRET_SHOULD_NOT_ESCAPE")
    expect(rendered).not.toContain("private-credential")
    expect(rendered).not.toContain("?secret=private")
    expect(outgoingTraceparent()).toBeUndefined()
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
