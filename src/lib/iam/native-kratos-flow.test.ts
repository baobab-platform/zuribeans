import { describe, expect, it } from "vitest"
import { projectNativeKratosFlow, validKratosFlowId } from "./native-kratos-flow"

const id = "11111111-1111-4111-8111-111111111111"
const origin = "https://n02.zuribeans.example.test/"
function fixture(kind: "login" | "recovery" = "login") {
  return {
    id,
    type: "browser",
    ui: {
      action: `${origin}self-service/${kind}?flow=${id}`,
      method: "POST",
      nodes: [
        {
          type: "input",
          attributes: {
            node_type: "input",
            name: "csrf_token",
            type: "hidden",
            value: "c".repeat(48),
            required: true,
          },
        },
        {
          type: "input",
          attributes: {
            node_type: "input",
            name: kind === "login" ? "identifier" : "email",
            type: "text",
            required: true,
          },
        },
        {
          type: "input",
          attributes: {
            node_type: "input",
            name: kind === "login" ? "password" : "code",
            type: "password",
            required: true,
          },
        },
        {
          type: "input",
          attributes: {
            node_type: "input",
            name: "method",
            type: "submit",
            value: kind === "login" ? "password" : "code",
            meta: "ignored",
          },
        },
      ],
      messages: [{ text: "Check the current account ceremony" }],
    },
  }
}

describe("N02 actual Kratos browser flow projection (source-only)", () => {
  it("accepts only a one-flow same-origin Kratos POST form", () => {
    expect(validKratosFlowId(id)).toBe(true)
    const result = projectNativeKratosFlow(fixture(), "login", id, origin)
    expect(result.action).toBe(`/self-service/login?flow=${id}`)
    expect(result.inputs.find((input) => input.name === "csrf_token")?.type).toBe("hidden")
    expect(result.inputs.find((input) => input.name === "password")?.type).toBe("password")
    expect(result.notices).toEqual(["Check the current account ceremony"])
    expect(
      projectNativeKratosFlow(fixture("recovery"), "recovery", id, origin).inputs.some(
        (input) => input.name === "code",
      ),
    ).toBe(true)
  })

  it.each([
    [
      "wrong source",
      (doc: ReturnType<typeof fixture>) => {
        doc.id = "00000000-0000-4000-8000-000000000000"
      },
    ],
    [
      "remote action",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.action = `https://evil.example.test/self-service/login?flow=${id}`
      },
    ],
    [
      "wrong path",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.action = `/self-service/registration?flow=${id}`
      },
    ],
    [
      "unknown query",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.action += "&return_to=https://evil.example.test"
      },
    ],
    [
      "stale method",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.method = "GET"
      },
    ],
    [
      "missing csrf",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes.splice(0, 1)
      },
    ],
    [
      "duplicate csrf",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes.push(doc.ui.nodes[0])
      },
    ],
    [
      "malicious form input",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes[1].attributes.name = "tenant_id"
      },
    ],
    [
      "dangerous hidden input",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes[2].attributes.name = "access_token"
      },
    ],
    [
      "non-browser flow",
      (doc: ReturnType<typeof fixture>) => {
        doc.type = "api"
      },
    ],
    [
      "disabled CSRF",
      (doc: ReturnType<typeof fixture>) => {
        Object.assign(doc.ui.nodes[0].attributes, { disabled: true })
      },
    ],
    [
      "disabled method",
      (doc: ReturnType<typeof fixture>) => {
        Object.assign(doc.ui.nodes[3].attributes, { disabled: true })
      },
    ],
    [
      "non-submit method",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes[3].attributes.type = "text"
      },
    ],
    [
      "unknown ceremony method",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes[3].attributes.value = "registration"
      },
    ],
    [
      "password reflected into UI state",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes[2].attributes.value = "should-never-be-reflected"
      },
    ],
    [
      "password rendered as plaintext",
      (doc: ReturnType<typeof fixture>) => {
        doc.ui.nodes[2].attributes.type = "text"
      },
    ],
  ])("denies %s", (_, mutate) => {
    const doc = fixture()
    mutate(doc)
    expect(() => projectNativeKratosFlow(doc, "login", id, origin)).toThrow()
  })

  it("rejects plaintext origins and mismatched flow IDs", () => {
    expect(() =>
      projectNativeKratosFlow(fixture(), "login", id, origin.replace("https:", "http:")),
    ).toThrow()
    expect(validKratosFlowId("?flow=admin")).toBe(false)
    expect(() => projectNativeKratosFlow(fixture(), "login", "admin", origin)).toThrow()
  })
})
