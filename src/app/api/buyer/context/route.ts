import { authHandlers } from "@/lib/iam/oidc/handlers"
import { withBffTrace } from "@/lib/observability/w3c"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const POST = (request: Request): Promise<Response> =>
  withBffTrace(request, "buyer-context", () => authHandlers().buyerContext(request as never))
