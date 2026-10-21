import { authHandlers } from "@/lib/iam/oidc/handlers"

// Authentication performs credentialed network I/O and server-side custody;
// never prerender or execute it in an Edge runtime without the TLS store.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const GET = authHandlers().session
