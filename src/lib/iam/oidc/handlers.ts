import "server-only"
import { z } from "zod"
import {
  buyerSelection,
  readBuyerHandoffSettings,
  resolveBuyerHandoff,
  type BuyerHandoffSettings,
} from "../buyer/handoff"
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { newOpaqueHandle, type ConfidentialSessionStore } from "../store/confidential-store"
import { createConfidentialStoreFromEnv } from "../store/redis-backend"
import { AuthenticationDenied, readAuthSettings, type AuthSettings } from "./settings"
import { begin, discover, exchange } from "./protocol"
import { requireCurrentIamSession } from "./authority"
import { limitedBody } from "./transport"

// Distinct from the legacy Medusa customer cookie (zb_session), which this
// BFF neither reads nor replaces: no commerce operation trusts that token alone.
export const ATTEMPT = "__Host-zb-iam-login"
export const BINDING = "__Host-zb-iam-browser"
export const SESSION = "__Host-zb-iam-session"
const opaque = /^[A-Za-z0-9_-]{43}$(?![\s\S])/
const headers = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
}
function cookie(
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number,
  sameSite: "strict" | "lax" = "strict",
) {
  response.cookies.set(name, value, { secure: true, httpOnly: true, path: "/", sameSite, maxAge })
}
function clearAttempt(response: NextResponse) {
  cookie(response, ATTEMPT, "", 0, "lax")
  cookie(response, BINDING, "", 0, "lax")
}
/** Reject ambiguous cookies as well as malformed handles; no substring matching. */
function handle(request: NextRequest, name: string): string | undefined {
  // Next's cookie parser collapses repeated names; inspect the raw header first.
  const count = (request.headers.get("cookie") ?? "")
    .split(";")
    .filter((part) => part.trim().split("=", 1)[0] === name).length
  if (count > 1) throw new AuthenticationDenied()
  const all = request.cookies.getAll(name)
  if (all.length > 1) throw new AuthenticationDenied()
  const value = all[0]?.value
  if (value !== undefined && !opaque.test(value)) throw new AuthenticationDenied()
  return value
}
function origin(request: NextRequest, settings: AuthSettings, mutation = false) {
  const url = new URL(request.nextUrl.href)
  const canonical = new URL(settings.origin)
  if (settings.trustProxy) {
    // Next's Node adapter may construct nextUrl from its private listen address.
    // Only an explicitly trusted, access-controlled TLS proxy may bridge that
    // difference. It must overwrite these headers, never append caller values.
    // No header selects the origin: the deployment's exact configured origin wins.
    if (
      request.headers.get("host") !== canonical.host ||
      request.headers.get("x-forwarded-host") !== canonical.host ||
      request.headers.get("x-forwarded-proto") !== "https"
    )
      throw new AuthenticationDenied()
    url.protocol = canonical.protocol
    url.hostname = canonical.hostname
    url.port = canonical.port
  } else if (url.origin !== canonical.origin) throw new AuthenticationDenied()
  if (
    mutation &&
    (request.headers.get("origin") !== settings.origin ||
      ![null, "same-origin"].includes(request.headers.get("sec-fetch-site")))
  )
    throw new AuthenticationDenied()
  return url
}
function denied(status = 401) {
  return NextResponse.json({ code: "AUTHENTICATION_UNAVAILABLE_OR_DENIED" }, { status, headers })
}
/** Dependencies are explicit only for tests; production routes always use the
 * environment factory and verified TLS Redis. There is no process-local fallback.
 */
export interface AuthDependencies {
  settings: () => AuthSettings | null
  store: () => ConfidentialSessionStore | null
  fetcher?: typeof fetch
  buyerSettings?: () => BuyerHandoffSettings | null
}
const production: AuthDependencies = {
  settings: readAuthSettings,
  store: createConfidentialStoreFromEnv,
}
export function authHandlers(deps: AuthDependencies = production) {
  function context(request: NextRequest, mutation = false) {
    const settings = deps.settings()
    if (!settings) return null
    const url = origin(request, settings, mutation)
    const store = deps.store()
    if (!store) throw new AuthenticationDenied()
    return { settings, store, url }
  }
  return {
    /** POST plus exact Origin prevents unsolicited third-party login initiation.
     * Lax attempt/binding cookies survive the top-level provider callback. They
     * are separate random values and are never OAuth state or token containers.
     */
    async login(request: NextRequest) {
      try {
        const ctx = context(request, true)
        if (!ctx) return denied(404)
        const old = handle(request, ATTEMPT),
          binding = handle(request, BINDING)
        if (old && binding) await ctx.store.consumeLogin(old, binding)
        const { transaction, url } = begin(ctx.settings, await discover(ctx.settings, deps.fetcher))
        const browser = newOpaqueHandle()
        const attempt = await ctx.store.issueLogin(transaction, browser)
        const response = NextResponse.redirect(url, { status: 303, headers })
        cookie(response, ATTEMPT, attempt, 300, "lax")
        cookie(response, BINDING, browser, 300, "lax")
        return response
      } catch {
        const response = denied()
        clearAttempt(response)
        return response
      }
    },
    async callback(request: NextRequest) {
      try {
        const ctx = context(request)
        if (!ctx) return denied(404)
        const attempt = handle(request, ATTEMPT),
          browser = handle(request, BINDING)
        if (!attempt || !browser) throw new AuthenticationDenied()
        // GETDEL occurs before state/code/error checks or any network request.
        const transaction = await ctx.store.consumeLogin(attempt, browser)
        if (!transaction) throw new AuthenticationDenied()
        const session = await exchange(ctx.settings, transaction, ctx.url, deps.fetcher)
        const current = await requireCurrentIamSession(session, ctx.settings, deps.fetcher)
        // Trusted introspection can shorten the token endpoint's advertised
        // lifetime. Custody and cookie expiry must respect that current bound.
        session.expiresAt = current.expiresAt
        // Successful login rotates session handles and revokes a presented old session;
        // uncertainty is denied. Other browsers retain their own bounded sessions.
        const old = handle(request, SESSION)
        if (old) await ctx.store.revokeSession(old)
        const next = await ctx.store.createSession(session)
        // A 3xx continues the cross-site IAM navigation, so Chromium withholds
        // the Strict session cookie on /account. Commit a same-origin document
        // first; its fixed declarative navigation starts a new same-site request.
        // No script, external resource, OAuth value or caller destination enters
        // this document. The anchor also works if automatic refresh is disabled.
        const response = new NextResponse(
          '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
            '<meta name="referrer" content="no-referrer">' +
            '<meta http-equiv="refresh" content="0;url=/account">' +
            "<title>Completing sign-in</title></head><body>" +
            '<p>Completing sign-in. <a href="/account">Continue to your account</a>.</p>' +
            "</body></html>",
          {
            status: 200,
            headers: {
              ...headers,
              "Content-Type": "text/html; charset=utf-8",
              "Content-Security-Policy":
                "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
              "X-Frame-Options": "DENY",
            },
          },
        )
        cookie(response, SESSION, next, Math.floor((session.expiresAt - Date.now()) / 1000))
        clearAttempt(response)
        return response
      } catch {
        const response = denied()
        clearAttempt(response)
        return response
      }
    },
    /** Token-free session summary (ADR-IAM-0023 section 98). It says only that
     * the person is currently signed in; buyer context and authority come from
     * Trade per operation, never from this response.
     */
    async session(request: NextRequest) {
      try {
        const ctx = context(request)
        if (!ctx) return denied(404)
        const value = handle(request, SESSION)
        if (!value) throw new AuthenticationDenied()
        const session = await ctx.store.readSession(value)
        if (!session) throw new AuthenticationDenied()
        const current = await requireCurrentIamSession(session, ctx.settings, deps.fetcher)
        return NextResponse.json(
          { authenticated: true, expiresAt: current.expiresAt, csrfToken: session.csrfToken },
          { headers },
        )
      } catch {
        return denied()
      }
    },
    /** Company/country are selection requests, never browser-supplied authority. */
    async buyerContext(request: NextRequest) {
      try {
        const ctx = context(request, true)
        if (!ctx) return denied(404)
        const target = (deps.buyerSettings ?? readBuyerHandoffSettings)()
        if (!target) return denied(404)
        const value = handle(request, SESSION)
        if (!value || request.headers.get("content-type") !== "application/json")
          throw new AuthenticationDenied()
        const session = await ctx.store.readSession(value)
        if (!session) throw new AuthenticationDenied()
        const bytes = await limitedBody(request.body, AbortSignal.timeout(5000), 2048)
        const body = buyerSelection
          .extend({ csrfToken: z.string().regex(opaque) })
          .strict()
          .parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)))
        if (!timingSafeEqual(Buffer.from(body.csrfToken), Buffer.from(session.csrfToken)))
          throw new AuthenticationDenied()
        const buyer = await resolveBuyerHandoff(
          session,
          ctx.settings,
          target,
          {
            organisationId: body.organisationId,
            countryCode: body.countryCode,
          },
          deps.fetcher,
        )
        return NextResponse.json({ buyer }, { headers })
      } catch {
        return denied()
      }
    },
    /** Local logout remains possible when IAM is unavailable. It revokes
     * custody, not the provider's SSO session; no fabricated global logout claim.
     */
    async logout(request: NextRequest) {
      try {
        const ctx = context(request, true)
        if (!ctx) return denied(404)
        const value = handle(request, SESSION)
        if (!value) throw new AuthenticationDenied()
        const session = await ctx.store.readSession(value)
        if (!session) throw new AuthenticationDenied()
        if (request.headers.get("content-type") !== "application/x-www-form-urlencoded")
          throw new AuthenticationDenied()
        const bytes = await limitedBody(request.body, AbortSignal.timeout(5000), 1024)
        const form = new URLSearchParams(new TextDecoder("utf-8", { fatal: true }).decode(bytes))
        const csrf = form.get("csrfToken") ?? ""
        if (
          form.getAll("csrfToken").length !== 1 ||
          !opaque.test(csrf) ||
          !timingSafeEqual(Buffer.from(csrf), Buffer.from(session.csrfToken))
        )
          throw new AuthenticationDenied()
        await ctx.store.revokeSession(value)
        const response = NextResponse.redirect(new URL("/login", ctx.settings.origin), {
          status: 303,
          headers,
        })
        cookie(response, SESSION, "", 0)
        clearAttempt(response)
        return response
      } catch {
        return denied()
      }
    },
  }
}
