import { authHandlers } from "@/lib/iam/oidc/handlers"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const POST = authHandlers().buyerContext
