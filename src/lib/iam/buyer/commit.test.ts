// @vitest-environment node
import { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
vi.mock("../oidc/authority", () => ({
  requireCurrentIamSession: vi.fn(async () => ({
    tokenExpiresAt: Date.now() + 60000,
    expiresAt: Date.now() + 60000,
  })),
}))
vi.mock("./workload", () => ({
  currentBffWorkloadCredential: vi.fn(async () => ({
    accessToken: "private-bff-issuer-token",
    expiresAt: Date.now() + 60000,
  })),
}))
import { authHandlers, SESSION } from "../oidc/handlers"
import type { AuthSettings } from "../oidc/settings"
import type { ConfidentialSession } from "../store/confidential-store"
import { buyerCommitSelection, commitBuyerPurchase, readBuyerCommitSettings } from "./commit"

const ORG = "019a0915-a8c0-7000-8000-00000000a001"
const target = {
  endpoint: "https://trade.example.test/store/b2b/buyer-commit",
  publishableKey: "pk_synthetic_store_key_00001",
}
const settings: AuthSettings = {
  origin: "https://zuribeans.example.test",
  issuer: "https://iam.example.test",
  clientId: "baobab-dev-zuribeans-bff",
  clientSecret: "local-development-fixture-only",
  redirectUri: "https://zuribeans.example.test/api/iam/callback",
  introspectionEndpoint: "https://iam.example.test/introspect",
  algorithm: "RS256",
}
const session = (): ConfidentialSession => ({
  issuer: settings.issuer,
  subject: "fixture-human",
  accessToken: "private-human-token",
  csrfToken: "x".repeat(43),
  createdAt: Date.now() - 1000,
  expiresAt: Date.now() + 120000,
})
const selection = () => ({
  organisationId: ORG, countryCode: "ZA", cartId: "cart_fixture123",
  idempotencyKey: "browser-replay-key-012345",
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("DEV-07 confidential buyer commit (source-only, no buyer acceptance)", () => {
  it("is separately disabled and cannot inherit context-only activation", () => {
    expect(readBuyerCommitSettings({ ZURIBEANS_BUYER_HANDOFF_ENABLED: "true" })).toBeNull()
    expect(() => readBuyerCommitSettings({
      ZURIBEANS_BUYER_COMMIT_ENABLED: "true",
      ZURIBEANS_BUYER_HANDOFF_ENABLED: "true",
      ZURIBEANS_IAM_ENVIRONMENT: "production",
    })).toThrow()
  })
  it("admits no browser price or self-declared mandate or granted role", () => {
    expect(buyerCommitSelection.safeParse({
      ...selection(), tax: 0,
    }).success).toBe(false)
    expect(buyerCommitSelection.safeParse({
      ...selection(), duty: "0",
    }).success).toBe(false)
    expect(buyerCommitSelection.safeParse({
      ...selection(), principal_id: ORG,
    }).success).toBe(false)
    expect(buyerCommitSelection.safeParse({
      ...selection(), idempotencyKey: "x",
    }).success).toBe(false)
  })
  it("sends only a scoped cart, selected organisation, replay key and independently checked IAM evidence", async () => {
    const seen: Array<{ url: string; data: Record<string, unknown>; headers: Headers }> = []
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      const data = JSON.parse(String(init?.body))
      const headers = new Headers(init?.headers)
      seen.push({url:String(url),data,headers})
      return Response.json({
        outcome:"COMMITTED",order_id:"order_123456789abc",
        correlation_id: data.correlation_id,
      })
    })
    const result = await commitBuyerPurchase(session(),settings,target,selection(),fetcher)
    expect(result).toEqual({outcome:"COMMITTED",orderId:"order_123456789abc"})
    expect(seen).toHaveLength(1)
    expect(seen[0].url).toBe(target.endpoint)
    expect(seen[0].headers.get("authorization")).toBe("Bearer private-bff-issuer-token")
    expect(seen[0].headers.get("idempotency-key")).toBe(selection().idempotencyKey)
    expect(Object.keys(seen[0].data).sort()).toEqual([
      "cart_id","correlation_id","idempotency_key",
      "requested_country_code","requested_organisation_id",
      "subject_token","subject_token_type",
    ])
    expect(seen[0].data).not.toHaveProperty("amount_minor")
    expect(seen[0].data).not.toHaveProperty("seller_decision_id")
    expect(JSON.stringify(result)).not.toContain("token")
  })
  it("refuses a price-bearing request and refuses provider success with changed correlation", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({
      outcome:"COMMITTED",order_id:"order_123456789abc",
      correlation_id: "019a0915-a8c0-7000-8000-00000000a002",
    }))
    await expect(commitBuyerPurchase(session(),settings,target,selection(),fetcher))
      .rejects.toThrow()
    await expect(commitBuyerPurchase(
      session(),settings,target,{...selection(),cartId:"foreign"},fetcher))
      .rejects.toThrow()
  })
  it("rejects CSRF before any consequential outbound call", async () => {
    vi.stubEnv("ZURIBEANS_BUYER_COMMIT_ENABLED","true")
    vi.stubEnv("ZURIBEANS_BUYER_HANDOFF_ENABLED","true")
    vi.stubEnv("ZURIBEANS_IAM_ENVIRONMENT","development")
    vi.stubEnv("ZURIBEANS_TRADE_BASE_URL","https://trade.example.test")
    vi.stubEnv("ZURIBEANS_TRADE_PUBLISHABLE_KEY",target.publishableKey)
    const fetcher = vi.fn<typeof fetch>()
    const handlers = authHandlers({
      settings:()=>settings,
      store:()=>({ readSession:async ()=>session() }) as never,
      fetcher,
    })
    const request = new NextRequest("https://zuribeans.example.test/api/buyer/commit",{
      method:"POST",
      headers:{
        cookie:`${SESSION}=${"a".repeat(43)}`,
        "content-type":"application/json",
        origin:settings.origin,
        "sec-fetch-site":"same-origin",
      },
      body:JSON.stringify({...selection(),csrfToken:"y".repeat(43)}),
    })
    const response = await handlers.buyerCommit(request)
    expect(response.status).toBe(401)
    expect(fetcher).not.toHaveBeenCalled()
  })
})
