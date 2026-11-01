/** IAM-N02: strict projection of the actual Kratos *browser* flow.
 * This is only a display/form contract. The Kratos server retains sole
 * credential, recovery, CSRF, method, AAL and session authority.
 * No browser-supplied return URL, issuer, estate or tenant permission.
 */
export type NativeKratosKind = "login" | "recovery"
export interface KratosInput {
  name: string
  type: "hidden" | "text" | "email" | "password" | "number" | "submit"
  value?: string
  required: boolean
  label: string
}
export interface NativeKratosFlow {
  action: string
  inputs: KratosInput[]
  notices: string[]
}

const patterns: Record<NativeKratosKind, ReadonlySet<string>> = {
  login: new Set([
    "csrf_token",
    "method",
    "identifier",
    "password",
    "totp_code",
    "lookup_secret",
    "code",
  ]),
  recovery: new Set(["csrf_token", "method", "email", "code", "traits.email"]),
}
const types = new Set<KratosInput["type"]>([
  "hidden",
  "text",
  "email",
  "password",
  "number",
  "submit",
])
const FLOW = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid Kratos flow")
  return value as Record<string, unknown>
}
function safeNotice(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 5).flatMap((entry) => {
    try {
      const text = record(entry).text
      return typeof text === "string" && text.length <= 300 ? [text] : []
    } catch {
      return []
    }
  })
}

export function validKratosFlowId(value: string | null): value is string {
  return value !== null && FLOW.test(value)
}

export function projectNativeKratosFlow(
  value: unknown,
  kind: NativeKratosKind,
  flowId: string,
  browserOrigin: string,
): NativeKratosFlow {
  if (!validKratosFlowId(flowId)) throw new Error("Invalid Kratos flow")
  const doc = record(value)
  if (doc.id !== flowId || doc.type !== "browser") throw new Error("Wrong Kratos browser flow")
  const ui = record(doc.ui)
  if (typeof ui.action !== "string" || ui.method !== "POST") throw new Error("Wrong Kratos action")
  const origin = new URL(browserOrigin)
  if (
    origin.protocol !== "https:" ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/"
  ) {
    throw new Error("Unreviewed first-party Kratos origin")
  }
  const action = new URL(ui.action, origin)
  const expectedPath = kind === "login" ? "/self-service/login" : "/self-service/recovery"
  if (
    action.origin !== origin.origin ||
    action.pathname !== expectedPath ||
    action.searchParams.size !== 1 ||
    action.searchParams.get("flow") !== flowId ||
    action.hash !== ""
  )
    throw new Error("Cross-origin or unexpected Kratos form target")
  if (!Array.isArray(ui.nodes) || ui.nodes.length === 0 || ui.nodes.length > 30) {
    throw new Error("Kratos form nodes unavailable")
  }
  const inputs: KratosInput[] = []
  let csrfCount = 0
  let methodCount = 0
  for (const raw of ui.nodes) {
    const node = record(raw)
    if (node.type !== "input") continue
    const attrs = record(node.attributes)
    const name = attrs.name
    const type = attrs.type
    if (
      typeof name !== "string" ||
      !patterns[kind].has(name) ||
      !types.has(type as KratosInput["type"]) ||
      typeof type !== "string"
    ) {
      throw new Error("Unknown Kratos credential node")
    }
    if (name === "csrf_token") {
      csrfCount += 1
      if (type !== "hidden" || typeof attrs.value !== "string" || attrs.value.length < 16) {
        throw new Error("Missing real Kratos CSRF")
      }
    }
    if (name === "method") methodCount += 1
    if (attrs.disabled === true) continue
    const value = attrs.value
    if (value !== undefined && typeof value !== "string")
      throw new Error("Unsupported Kratos form value")
    const meta = node.meta && typeof node.meta === "object" ? record(node.meta) : {}
    const label = meta.label && typeof meta.label === "object" ? record(meta.label).text : undefined
    inputs.push({
      name,
      type: type as KratosInput["type"],
      ...(typeof value === "string" ? { value } : {}),
      required: attrs.required === true,
      label: typeof label === "string" && label.length <= 120 ? label : name,
    })
  }
  if (csrfCount !== 1 || methodCount === 0 || inputs.length < 3) {
    throw new Error("Kratos browser CSRF/method missing")
  }
  return {
    action: action.pathname + action.search,
    inputs,
    notices: safeNotice(ui.messages),
  }
}
