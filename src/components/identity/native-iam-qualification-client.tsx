"use client"

import { useCallback, useEffect, useState } from "react"
import { exactNativeSession } from "@/lib/iam/native-qualification-session"

// The public browser never receives or persists the CP Principal UUID, any
// OAuth bearer/refresh token, Kratos identity, organisational roles or market.
// This status UI does NOT consume the separate Next /api/iam/* BFF session.
type State = "checking" | "unauthenticated" | "authenticated" | "unavailable"
export function NativeIamQualificationClient() {
  const [state, setState] = useState<State>("checking")
  const [csrf, setCsrf] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setCsrf(null)
    setState("checking")
    try {
      const response = await fetch("/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        redirect: "manual",
        headers: { Accept: "application/json" },
      })
      if (response.status === 401) {
        setState("unauthenticated")
        return
      }
      if (
        response.status !== 200 ||
        !response.headers.get("content-type")?.startsWith("application/json")
      ) {
        setState("unavailable")
        return
      }
      const session: unknown = await response.json()
      if (!exactNativeSession(session)) {
        setState("unavailable")
        return
      }
      setCsrf(session.csrf)
      setState("authenticated")
    } catch {
      setState("unavailable")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function logoutAll() {
    if (state !== "authenticated" || !csrf) return
    // CSRF is already bound by the BFF to its one opaque server-side session.
    // Native issuer/CP revocation failures become UNKNOWN, never SUCCESS.
    setState("checking")
    try {
      const response = await fetch("/auth/logout-all", {
        method: "POST",
        credentials: "same-origin",
        redirect: "manual",
        cache: "no-store",
        headers: { "X-CSRF-Token": csrf, Accept: "application/json" },
      })
      setCsrf(null)
      if (response.status !== 204) {
        setState("unavailable")
        return
      }
      await refresh()
    } catch {
      setCsrf(null)
      setState("unavailable")
    }
  }

  return (
    <section aria-label="Native IAM development status" className="mt-10 space-y-5">
      <p role="status" aria-live="polite" className="text-muted">
        {state === "checking"
          ? "Checking the current IAM and Control Plane session…"
          : state === "authenticated"
            ? "The current IAM session was independently resolved to an active Control Plane Principal."
            : state === "unauthenticated"
              ? "No governed IAM session is active."
              : "Native IAM/Control Plane status is unavailable. Access remains denied."}
      </p>
      {state === "unauthenticated" ? (
        <div className="space-y-4">
          {/* An actual browser form POST supplies its own same-origin Origin.
              Never forward a caller-provided destination or OAuth state. */}
          <form method="POST" action="/auth/start">
            <button type="submit" className="rounded-control bg-ink px-6 py-3 font-semibold text-white">
              Continue with governed IAM
            </button>
          </form>
          <a href="/auth/recovery" className="inline-block font-semibold underline">
            Recover your IAM account
          </a>
        </div>
      ) : null}
      {state === "authenticated" ? (
        <button
          type="button"
          onClick={() => void logoutAll()}
          className="rounded-control border border-line-strong px-6 py-3 font-semibold"
        >
          Revoke all native IAM sessions
        </button>
      ) : null}
      {state === "unavailable" ? (
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-control border border-line-strong px-6 py-3 font-semibold"
        >
          Recheck native IAM status
        </button>
      ) : null}
      <p className="text-sm text-muted">
        Buyer onboarding and protected trading permissions are governed
        separately by Trade and the Control Plane.
      </p>
    </section>
  )
}
