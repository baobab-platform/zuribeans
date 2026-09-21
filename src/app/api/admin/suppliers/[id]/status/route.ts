// Gate ZB-05 — staff lifecycle transition (ADR-0006 lifecycle, ADR-0011 auth).
// Registration ≠ approval: only assertSupplierStatusTransition paths succeed.
import "server-only"
import { z } from "zod"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"
import { isAuthorizedInternalRequest } from "@/lib/auth/internal-api-key"
import { transitionSupplierStatus } from "@/lib/supplier/repository"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"

export const dynamic = "force-dynamic"

const rejectionReasonCodes = [
  "incomplete_documentation",
  "business_not_verified",
  "product_not_required",
  "unacceptable_quality",
  "uncompetitive_commercials",
  "regulatory_failure",
  "sanctions_risk",
  "capacity_insufficient",
  "country_restriction",
  "duplicate_application",
  "misrepresentation",
  "other",
] as const

const statuses = [
  "draft",
  "submitted",
  "under_review",
  "more_information_required",
  "sample_required",
  "qualification",
  "approved",
  "rejected",
  "active",
  "suspended",
  "offboarded",
] as const satisfies readonly SupplierStatus[]

const bodySchema = z.object({
  status: z.enum(statuses),
  actor: z.string().min(1).max(200),
  reason: z.string().max(2000).optional(),
  rejection_reason_code: z.enum(rejectionReasonCodes).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

  if (parsed.data.status === "rejected" && !parsed.data.rejection_reason_code && !parsed.data.reason) {
    return Response.json(
      { error: "rejection_requires_reason" },
      { status: 400 },
    )
  }

  const reasonParts = [
    parsed.data.rejection_reason_code
      ? `rejection_reason_code=${parsed.data.rejection_reason_code}`
      : null,
    parsed.data.reason ?? null,
  ].filter(Boolean)

  const { id } = await params

  try {
    const updated = await transitionSupplierStatus({
      supplierOrganisationId: id,
      toStatus: parsed.data.status,
      actor: `staff:${parsed.data.actor}`,
      reason: reasonParts.length > 0 ? reasonParts.join("; ") : undefined,
    })

    if (!updated) {
      return Response.json({ error: "not_found" }, { status: 404 })
    }

    return Response.json({
      id: updated.id,
      status: updated.status,
      updated_at: updated.updatedAt.toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "transition_failed"
    if (/cannot transition/i.test(message)) {
      return Response.json({ error: "invalid_transition", message }, { status: 409 })
    }
    throw error
  }
}
