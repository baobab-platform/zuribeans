import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST_SSO_REDIRECT_COOKIE_NAME } from "@/lib/auth/sso"

const authCallback = vi.fn()
vi.mock("@/lib/medusa/client", () => ({
  createMedusaClient: () => ({ auth: { callback: authCallback } }),
}))

const cookieStore = {
  get: vi.fn<(name: string) => { value: string } | undefined>(),
  delete: vi.fn(),
}
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }))

import { GET } from "./route"

describe("GET /api/auth/callback", () => {
  beforeEach(() => {
    authCallback.mockReset()
    cookieStore.get.mockReset()
    cookieStore.delete.mockClear()
  })

  it("forwards the OIDC code/state to Trade, clears the stashed cookie, and redirects to the stashed path", async () => {
    cookieStore.get.mockReturnValue({ value: "/account/buyer" })
    authCallback.mockResolvedValue("customer-jwt-token")

    const request = new Request("http://localhost:3000/api/auth/callback?code=abc123&state=xyz789")
    const response = await GET(request)

    expect(authCallback).toHaveBeenCalledWith("customer", "zuribeans-oidc", {
      code: "abc123",
      state: "xyz789",
    })
    expect(cookieStore.delete).toHaveBeenCalledWith(POST_SSO_REDIRECT_COOKIE_NAME)
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3000/account/buyer")
  })

  it("falls back to /account when no return-to cookie was stashed", async () => {
    cookieStore.get.mockReturnValue(undefined)
    authCallback.mockResolvedValue("customer-jwt-token")

    const request = new Request("http://localhost:3000/api/auth/callback?code=abc123")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/account")
  })

  it("never redirects to an unsafe stashed path", async () => {
    cookieStore.get.mockReturnValue({ value: "//evil.com" })
    authCallback.mockResolvedValue("customer-jwt-token")

    const request = new Request("http://localhost:3000/api/auth/callback?code=abc123")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/account")
  })

  it("redirects to a login error when Trade rejects the callback", async () => {
    cookieStore.get.mockReturnValue({ value: "/account/buyer" })
    authCallback.mockRejectedValue(new Error("invalid state"))

    const request = new Request("http://localhost:3000/api/auth/callback?error=access_denied")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=sso_unavailable&next=%2Faccount%2Fbuyer",
    )
  })

  it("redirects to a login error when the callback resolves an empty token", async () => {
    cookieStore.get.mockReturnValue({ value: "/account" })
    authCallback.mockResolvedValue("")

    const request = new Request("http://localhost:3000/api/auth/callback?code=abc123")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=sso_unavailable&next=%2Faccount",
    )
  })
})
