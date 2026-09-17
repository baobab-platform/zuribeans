import { beforeEach, describe, expect, it, vi } from "vitest"
import { POST_SSO_REDIRECT_COOKIE_NAME } from "@/lib/auth/sso"

const { authLogin, redirectMock, cookieStore } = vi.hoisted(() => ({
  authLogin: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
  cookieStore: { set: vi.fn(), get: vi.fn(), delete: vi.fn(), has: vi.fn() },
}))

vi.mock("@/lib/medusa/client", () => ({
  createMedusaClient: () => ({ auth: { login: authLogin } }),
}))
vi.mock("next/navigation", () => ({ redirect: redirectMock }))
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }))

import { loginWithSsoAction } from "./actions"

const formDataWithNext = (next?: string) => {
  const data = new FormData()
  if (next) data.set("next", next)
  return data
}

describe("loginWithSsoAction", () => {
  beforeEach(() => {
    authLogin.mockReset()
    redirectMock.mockClear()
    cookieStore.set.mockClear()
  })

  it("stashes the return-to path and redirects the browser to IAM's authorize URL", async () => {
    authLogin.mockResolvedValue({ location: "https://iam.example.com/authorize?state=abc" })

    await expect(loginWithSsoAction(formDataWithNext("/account/buyer"))).rejects.toThrow(
      "REDIRECT:https://iam.example.com/authorize?state=abc",
    )

    expect(authLogin).toHaveBeenCalledWith("customer", "zuribeans-oidc", {})
    expect(cookieStore.set).toHaveBeenCalledWith(
      POST_SSO_REDIRECT_COOKIE_NAME,
      "/account/buyer",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    )
  })

  it("falls back to /account when no next path is supplied", async () => {
    authLogin.mockResolvedValue({ location: "https://iam.example.com/authorize" })

    await expect(loginWithSsoAction(formDataWithNext())).rejects.toThrow("REDIRECT:")

    expect(cookieStore.set).toHaveBeenCalledWith(
      POST_SSO_REDIRECT_COOKIE_NAME,
      "/account",
      expect.anything(),
    )
  })

  it("rejects an unsafe next path rather than stashing it", async () => {
    authLogin.mockResolvedValue({ location: "https://iam.example.com/authorize" })

    await expect(loginWithSsoAction(formDataWithNext("//evil.com"))).rejects.toThrow("REDIRECT:")

    expect(cookieStore.set).toHaveBeenCalledWith(
      POST_SSO_REDIRECT_COOKIE_NAME,
      "/account",
      expect.anything(),
    )
  })

  it("redirects to a login error when the provider returns no redirect location", async () => {
    authLogin.mockResolvedValue("unexpected-direct-token")

    await expect(loginWithSsoAction(formDataWithNext("/account"))).rejects.toThrow(
      "REDIRECT:/login?error=sso_unavailable&next=%2Faccount",
    )
    expect(cookieStore.set).not.toHaveBeenCalled()
  })

  it("redirects to a login error when the provider call throws", async () => {
    authLogin.mockRejectedValue(new Error("network error"))

    await expect(loginWithSsoAction(formDataWithNext("/account"))).rejects.toThrow(
      "REDIRECT:/login?error=sso_unavailable&next=%2Faccount",
    )
    expect(cookieStore.set).not.toHaveBeenCalled()
  })
})
