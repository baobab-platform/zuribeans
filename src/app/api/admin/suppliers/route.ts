// Gate ZB-05 — list supplier applications for staff review (ADR-0011).
import "server-only"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"
import { isAuthorizedInternalRequest } from "@/lib/auth/internal-api-key"
import { listSupplierApplications } from "@/lib/supplier/repository"
import type { SupplierStatus } from "@/lib/supplier/lifecycle"

export const dynamic = "force-dynamic"

const STATUSES: readonly SupplierStatus[] = [
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
]

const isStatus = (value: string | null): value is SupplierStatus =>
  value !== null && (STATUSES as readonly string[]).includes(value)

export async function GET(request: Request): Promise<Response> {
  const { SUPPLIER_ADMIN_API_KEY } = getSupplierAdminEnvironment()
  if (!isAuthorizedInternalRequest(request.headers.get("authorization"), SUPPLIER_ADMIN_API_KEY)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const statusParam = url.searchParams.get("status")
  if (statusParam !== null && !isStatus(statusParam)) {
    return Response.json({ error: "invalid_status" }, { status: 400 })
  }

  const limitRaw = url.searchParams.get("limit")
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined
  if (limit !== undefined && Number.isNaN(limit)) {
    return Response.json({ error: "invalid_limit" }, { status: 400 })
  }

  const organisations = await listSupplierApplications({
    status: statusParam ?? undefined,
    limit,
  })

  return Response.json({
    applications: organisations.map((org) => ({
      id: org.id,
      legal_name: org.legalName,
      country_code: org.countryCode,
      status: org.status,
      medusa_customer_id: org.medusaCustomerId,
      canonical_organisation_id: org.canonicalOrganisationId,
      submitted_at: org.submittedAt?.toISOString() ?? null,
      created_at: org.createdAt.toISOString(),
      updated_at: org.updatedAt.toISOString(),
    })),
  })
}
