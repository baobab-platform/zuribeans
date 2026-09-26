import { describe, expect, it } from "vitest"
import { parseBuyerInvitation } from "./buyer-invitation"

describe("parseBuyerInvitation", () => {
  it("normalizes a valid invitation", () => {
    expect(parseBuyerInvitation(" Buyer@Example.COM ", "APPROVER")).toEqual({
      email: "buyer@example.com",
      role: "APPROVER",
    })
  })

  it.each([
    ["missing domain", "buyer@", "BUYER"],
    ["unsupported role", "buyer@example.com", "ACCOUNT_ADMIN"],
    ["blank email", " ", "VIEWER"],
  ])("rejects %s", (_label, email, role) => {
    expect(parseBuyerInvitation(email, role)).toBeNull()
  })
})
