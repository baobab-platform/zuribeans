import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  isErpProjectionConfigured,
  projectSupplierBusinessPartner,
  publicErpBusinessPartnerId,
} from "./business-partner-client"

const input = {
  canonicalOrganisationId: "019a0000-0000-7000-8000-000000000001",
  displayName: "Synthetic supplier",
  countryCode: "UG",
  readinessStatus: "READY" as const,
}
const projection = {
  legal_entity_id: "SYNTHETIC-ESTATE-UG",
  business_partner_id: "erp_opaque123",
  roles: ["supplier"],
  display_name: "Synthetic supplier",
  status: "active",
  revision: 1,
  billing_country: "UG",
}
const fetcher = vi.fn<typeof fetch>()
const reply = (partner: unknown = projection, scope: Record<string, unknown> = {}) =>
  Response.json({
    tenant_id: "tn_synthetic123",
    engine_instance_id: "ei_synthetic123",
    canonical_organisation_id: input.canonicalOrganisationId,
    business_partner: partner,
    ...scope,
  })
describe("legacy ERP supplier adapter — no provider qualification", () => {
  beforeEach(() => {
    vi.stubEnv("BAOBAB_ERP_BASE_URL", "https://erp.example")
    vi.stubEnv("BAOBAB_ERP_WORKLOAD_TOKEN", "synthetic-workload-token-never-issued")
    vi.stubEnv("BAOBAB_ERP_ENGINE_INSTANCE_ID", "ei_synthetic123")
    vi.stubEnv("BAOBAB_ERP_TENANT_ID", "tn_synthetic123")
    vi.stubEnv("BAOBAB_ERP_LEGAL_ENTITY_ID", "SYNTHETIC-ESTATE-UG")
    fetcher.mockReset()
    vi.stubGlobal("fetch", fetcher)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("accepts only a matching active supplier receipt and a bounded public ID", async () => {
    fetcher.mockResolvedValue(reply())
    expect(await projectSupplierBusinessPartner(input)).toEqual({ ok: true, projection })
    expect(fetcher).toHaveBeenCalledOnce()
    const [url, options] = fetcher.mock.calls[0]
    expect(url).toBe("https://erp.example/business-partners/project")
    expect(options).toMatchObject({ method: "POST", redirect: "error", cache: "no-store" })
    expect(options?.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(options?.body as string)).toMatchObject({
      tenant_id: "tn_synthetic123",
      entity_id: "SYNTHETIC-ESTATE-UG",
      engine_instance_id: "ei_synthetic123",
      roles: ["supplier"],
    })
  })

  it("refuses incomplete, inferred, insecure or credential-bearing deployment configuration before fetch", async () => {
    for (const [name, value] of [
      ["BAOBAB_ERP_ENGINE_INSTANCE_ID", ""],
      ["BAOBAB_ERP_ENGINE_INSTANCE_ID", "erp-zuribeans"],
      ["BAOBAB_ERP_TENANT_ID", "ZURIBEANS"],
      ["BAOBAB_ERP_LEGAL_ENTITY_ID", "zuribeans_ug"],
      ["BAOBAB_ERP_BASE_URL", "http://erp.example"],
      ["BAOBAB_ERP_BASE_URL", "https://user:secret@erp.example"],
      ["BAOBAB_ERP_BASE_URL", "https://erp.example?secret=x"],
      ["BAOBAB_ERP_BASE_URL", "https://erp.example/path"],
      ["NODE_TLS_REJECT_UNAUTHORIZED", "0"],
    ]) {
      const old = process.env[name]
      process.env[name] = value
      expect(isErpProjectionConfigured(), name + ":" + value).toBe(false)
      expect(await projectSupplierBusinessPartner(input)).toMatchObject({
        ok: false,
        reason: "not_configured",
      })
      if (old === undefined) delete process.env[name]
      else process.env[name] = old
    }
    expect(fetcher).not.toHaveBeenCalled()
  })

  it("does not send invalid supplier input", async () => {
    for (const change of [
      { canonicalOrganisationId: "" },
      { displayName: " " },
      { countryCode: "ug" },
    ])
      expect(await projectSupplierBusinessPartner({ ...input, ...change })).toMatchObject({
        ok: false,
        reason: "invalid_request",
      })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it("rejects a foreign actor, customer-only role, inactive result, invalid revision or native ID", async () => {
    for (const change of [
      { legal_entity_id: "OTHER-ESTATE" },
      { billing_country: "ZA" },
      { roles: ["customer"] },
      { roles: ["supplier", "supplier"] },
      { status: "suspended" },
      { revision: "1" },
      { revision: 0 },
      { business_partner_id: "12345" },
      { business_partner_id: "erp_UPPERCASE" },
      { business_partner_id: "erp_a" },
      { native_id: 99 },
    ]) {
      fetcher.mockResolvedValue(reply({ ...projection, ...change }))
      expect(await projectSupplierBusinessPartner(input)).toMatchObject({
        ok: false,
        reason: "invalid_response",
      })
    }
  })

  it("bounds successful response bodies and rejects malformed JSON without echoing it", async () => {
    for (const response of [
      new Response("private native response", { headers: { "content-type": "application/json" } }),
      new Response("x".repeat(65537), { headers: { "content-type": "application/json" } }),
      new Response("private HTML", { headers: { "content-type": "text/html" } }),
      Response.json({ unexpected: projection }),
    ]) {
      fetcher.mockResolvedValue(response)
      const result = await projectSupplierBusinessPartner(input)
      expect(result).toMatchObject({ ok: false, reason: "invalid_response" })
      expect(JSON.stringify(result)).not.toContain("private")
    }
  })

  it("does not attribute an unbound or foreign supplier projection to the requested Organisation", async () => {
    for (const scope of [
      { tenant_id: "tn_other123" },
      { engine_instance_id: "ei_other123" },
      { canonical_organisation_id: "different-company" },
    ]) {
      fetcher.mockResolvedValue(reply(projection, scope))
      expect(await projectSupplierBusinessPartner(input)).toMatchObject({
        ok: false,
        reason: "invalid_response",
      })
    }
    fetcher.mockResolvedValue(Response.json({ business_partner: projection }))
    expect(await projectSupplierBusinessPartner(input)).toMatchObject({
      ok: false,
      reason: "invalid_response",
    })
  })

  it("distinguishes a refused request from a possible native effect and never exposes an upstream error body", async () => {
    fetcher.mockResolvedValue(new Response("private provider detail", { status: 403 }))
    expect(await projectSupplierBusinessPartner(input)).toEqual({
      ok: false,
      reason: "http_error",
      detail: "ERP refused the supplier projection request.",
    })
    for (const status of [302, 500, 503]) {
      fetcher.mockResolvedValue(new Response("private provider detail", { status }))
      expect(await projectSupplierBusinessPartner(input)).toMatchObject({
        ok: false,
        reason: "outcome_unknown",
      })
    }
    fetcher.mockRejectedValue(new Error("private network credentials"))
    const result = await projectSupplierBusinessPartner(input)
    expect(result).toMatchObject({ ok: false, reason: "outcome_unknown" })
    expect(JSON.stringify(result)).not.toContain("private")
  })

  it("uses the exact Shared erpResourceId output grammar", () => {
    expect(publicErpBusinessPartnerId.safeParse("erp_abcd").success).toBe(true)
    expect(publicErpBusinessPartnerId.safeParse("erp_" + "a".repeat(59)).success).toBe(true)
    for (const value of ["erp_abc", "erp_" + "a".repeat(60), "erp_UPPER", "C_BPartner_99"])
      expect(publicErpBusinessPartnerId.safeParse(value).success).toBe(false)
  })
})
