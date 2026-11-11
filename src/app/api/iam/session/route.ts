import type { NextRequest } from "next/server"
import { authHandlers } from "@/lib/iam/oidc/handlers"
import { withBffTrace } from "@/lib/observability/w3c"

// OAuth browser navigation starts a distinct linked server trace; neither
// trace IDs nor headers replace OAuth state, PKCE or confidential-session custody.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const GET = (request: NextRequest): Promise<Response> =>
  withBffTrace(request, "iam-session", () => authHandlers().session(request))
