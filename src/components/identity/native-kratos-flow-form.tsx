import "server-only"
import { headers } from "next/headers"
import {
  projectNativeKratosFlow,
  validKratosFlowId,
  type NativeKratosFlow,
  type NativeKratosKind,
} from "@/lib/iam/native-kratos-flow"

/**
 * Server-rendered Kratos browser form: only a reviewed, exact HTTPS origin may
 * be contacted. Credentials and one-time codes go from the browser straight
 * to Kratos; no Next route handler or client-side React state receives them.
 * The public Kratos flow itself is retrieved using the same browser cookie.
 */
async function currentFlow(
  kind: NativeKratosKind,
  flowId: string | null,
): Promise<NativeKratosFlow | null> {
  if (!validKratosFlowId(flowId)) return null
  const configuredOrigin = process.env.ZURIBEANS_N02_PUBLIC_ORIGIN
  if (!configuredOrigin) return null

  try {
    const origin = new URL(configuredOrigin)
    const requestHeaders = await headers()
    if (
      origin.protocol !== "https:" ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      requestHeaders.get("host") !== origin.host
    ) {
      return null
    }

    const url = new URL(`/self-service/${kind}/flows?id=${encodeURIComponent(flowId)}`, origin)
    const cookies = requestHeaders.get("cookie")
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
      headers: { Accept: "application/json", ...(cookies ? { Cookie: cookies } : {}) },
    })
    if (
      response.status !== 200 ||
      !response.headers.get("content-type")?.startsWith("application/json")
    ) {
      return null
    }
    const raw = await response.text()
    if (raw.length > 65536) return null
    return projectNativeKratosFlow(JSON.parse(raw) as unknown, kind, flowId, origin.href)
  } catch {
    return null
  }
}

export async function NativeKratosFlowForm({
  kind,
  flowId,
}: {
  kind: NativeKratosKind
  flowId: string | null
}) {
  const flow = await currentFlow(kind, flowId)
  const start = `/self-service/${kind}/browser`

  if (!flow) {
    return (
      <section aria-label="Kratos browser flow unavailable" className="mt-8 space-y-5">
        <p role="alert">
          This authentication flow is unavailable or expired. No access was granted.
        </p>
        <a className="underline" href={start}>
          Start a new governed {kind} flow
        </a>
      </section>
    )
  }

  return (
    <section
      aria-label={kind === "login" ? "Kratos login" : "Kratos recovery"}
      className="mt-8 space-y-5"
    >
      {flow.notices.map((message, index) => (
        <p role="alert" key={index}>
          {message}
        </p>
      ))}
      <form method="post" action={flow.action} autoComplete={kind === "login" ? "on" : "off"}>
        <div className="space-y-4">
          {flow.inputs.map((input, index) => {
            if (input.type === "hidden") {
              return <input key={index} type="hidden" name={input.name} value={input.value ?? ""} />
            }
            if (input.type === "submit") {
              return (
                <button
                  key={index}
                  type="submit"
                  name={input.name}
                  value={input.value ?? ""}
                  className="rounded-control bg-ink px-6 py-3 font-semibold text-white"
                >
                  {input.label}
                </button>
              )
            }
            return (
              <label key={index} className="block space-y-2">
                <span>{input.label}</span>
                <input
                  className="w-full rounded-control border border-line-strong px-4 py-3"
                  name={input.name}
                  type={input.type}
                  required={input.required}
                  defaultValue={
                    input.type === "text" || input.type === "email" ? input.value : undefined
                  }
                  autoComplete={
                    input.name === "password"
                      ? "current-password"
                      : input.name === "identifier"
                        ? "username"
                        : input.name.includes("email")
                          ? "email"
                          : "off"
                  }
                />
              </label>
            )
          })}
        </div>
      </form>
      {kind === "login" ? (
        <a href="/auth/recovery" className="underline">
          Recover your IAM account
        </a>
      ) : (
        <a href="/self-service/login/browser" className="underline">
          Return to governed login
        </a>
      )}
      <p className="text-sm text-muted">
        This Kratos session does not create a buyer, membership, legal mandate or Trade permission.
      </p>
    </section>
  )
}
