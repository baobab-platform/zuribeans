import type { NextRequest } from "next/server"
import { authHandlers } from "@/lib/iam/oidc/handlers"
import { withBffTrace } from "@/lib/observability/w3c"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Browser never talks directly to the Trade consequential operation.
export const POST = (request: NextRequest): Promise<Response> =>
  withBffTrace(request, "buyer-commit", () => authHandlers().buyerCommit(request))
