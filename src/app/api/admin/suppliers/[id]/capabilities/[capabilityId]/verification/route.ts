// Gate ZB-05 — capability declared ≠ verified (Shared supplier-onboarding SoR).
import "server-only"
import { z } from "zod"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"
import { isAuthorizedInternalRequest } from "@/lib/auth/internal-api-key"
import { setCapabilityVerification } from "@/lib/supplier/repository"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  status: z.enum(["verified", "rejected"]),
  actor: z.string().min(1).max(200),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; capabilityId: string }> },
): Promise<Response> {
  const { SUPPLIER_ADMIN_API_KEY } = getSupplierAdminEnvironment()
  if (!isAuthorizedInternalRequest(request.headers.get("authorization"), SUPPLIER_ADMIN_API_KEY)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) {
    return Response.json({ error: "invalid_request", issues: parsed.error.issues }, { status: 400 })
  }

  const { id, capabilityId } = await params
  const row = await setCapabilityVerification({
    supplierOrganisationId: id,
    capabilityId,
    status: parsed.data.status,
    verifiedBy: `staff:${parsed.data.actor}`,
  })

  if (!row) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  return Response.json({
    id: row.id,
    verification_status: row.verificationStatus,
    verified_at: row.verifiedAt?.toISOString() ?? null,
    verified_by: row.verifiedBy,
  })
}
