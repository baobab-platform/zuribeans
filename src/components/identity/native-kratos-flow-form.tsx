"use client"

import { useEffect, useState } from "react"
import {
  projectNativeKratosFlow,
  validKratosFlowId,
  type NativeKratosFlow,
  type NativeKratosKind,
} from "@/lib/iam/native-kratos-flow"

type State = "loading" | "ready" | "unavailable"

/**
 * A real browser form submitted directly to Kratos's same-origin public
 * endpoint. Passwords, TOTPs and recovery codes are NEVER placed into React
 * state, JavaScript fetch arguments, app logs or the Next.js server.
 */
export function NativeKratosFlowForm({ kind }: { kind: NativeKratosKind }) {
  const [phase, setPhase] = useState<State>("loading")
  const [flow, setFlow] = useState<NativeKratosFlow | null>(null)

  useEffect(() => {
    let live = true
    async function load() {
      try {
        const id = new URL(window.location.href).searchParams.get("flow")
        if (!validKratosFlowId(id)) throw new Error("Missing flow")
        if (window.location.protocol !== "https:") throw new Error("TLS required")
        const response = await fetch(
          `/self-service/${kind}/flows?id=${encodeURIComponent(id)}`,
          { credentials: "same-origin", cache: "no-store", redirect: "manual",
            headers: { Accept: "application/json" } },
        )
        if (response.status !== 200 || !response.headers.get("content-type")?.startsWith("application/json")) {
          throw new Error("No current browser flow")
        }
        const raw = await response.text()
        if (raw.length > 65536) throw new Error("Oversize Kratos flow")
        const projected = projectNativeKratosFlow(JSON.parse(raw) as unknown, kind, id, window.location.origin + "/")
        if (live) {
          setFlow(projected)
          setPhase("ready")
        }
      } catch {
        if (live) {
          setFlow(null)
          setPhase("unavailable")
        }
      }
    }
    void load()
    return () => { live = false }
  }, [kind])

  const start = `/self-service/${kind}/browser`
  return (
    <section aria-label={kind === "login" ? "Kratos login" : "Kratos recovery"} className="mt-8 space-y-5">
      {phase === "loading" && <p role="status">Loading current verified IAM flow…</p>}
      {phase === "unavailable" && (
        <>
          <p role="alert">This authentication flow is unavailable or expired. No access was granted.</p>
          <a className="underline" href={start}>Start a new governed {kind} flow</a>
        </>
      )}
      {phase === "ready" && flow && (
        <>
          {flow.notices.map((message, index) => (
            <p role="alert" key={index}>{message}</p>
          ))}
          <form method="post" action={flow.action} autoComplete={kind === "login" ? "on" : "off"}>
            <div className="space-y-4">
              {flow.inputs.map((input, index) => {
                if (input.type === "hidden") {
                  return <input key={index} type="hidden" name={input.name} value={input.value ?? ""} />
                }
                if (input.type === "submit") {
                  return (
                    <button key={index} type="submit" name={input.name}
                      value={input.value ?? ""} className="rounded-control bg-ink px-6 py-3 font-semibold text-white">
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
                      // Never persist or controlled-bind secrets in React.
                      defaultValue={input.type === "text" || input.type === "email" ? input.value : undefined}
                      autoComplete={input.name === "password" ? "current-password"
                        : input.name === "identifier" ? "username"
                          : input.name.includes("email") ? "email" : "off"}
                    />
                  </label>
                )
              })}
            </div>
          </form>
          {kind === "login" ? (
            <a href="/auth/recovery" className="underline">Recover your IAM account</a>
          ) : (
            <a href="/self-service/login/browser" className="underline">Return to governed login</a>
          )}
          <p className="text-sm text-muted">
            This Kratos session does not create a buyer, membership, legal mandate or Trade permission.
          </p>
        </>
      )}
    </section>
  )
}
