// Gate ZB-05 — supplier application detail for staff review (ADR-0011).
import "server-only"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"
import { isAuthorizedInternalRequest } from "@/lib/auth/internal-api-key"
import { getSupplierApplicationById } from "@/lib/supplier/repository"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { SUPPLIER_ADMIN_API_KEY } = getSupplierAdminEnvironment()
  if (!isAuthorizedInternalRequest(request.headers.get("authorization"), SUPPLIER_ADMIN_API_KEY)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const detail = await getSupplierApplicationById(id)
  if (!detail) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  const { organisation, capabilities, certifications, contacts, statusEvents } = detail

  return Response.json({
    id: organisation.id,
    legal_name: organisation.legalName,
    registration_number: organisation.registrationNumber,
    tax_identifier: organisation.taxIdentifier,
    country_code: organisation.countryCode,
    status: organisation.status,
    medusa_customer_id: organisation.medusaCustomerId,
    canonical_organisation_id: organisation.canonicalOrganisationId,
    submitted_at: organisation.submittedAt?.toISOString() ?? null,
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      phone: c.phone,
    })),
    capabilities: capabilities.map((c) => ({
      id: c.id,
      product_category: c.productCategory,
      variety: c.variety,
      grade: c.grade,
      origin_country_code: c.originCountryCode,
      capacity_description: c.capacityDescription,
      season: c.season,
      lead_time_days: c.leadTimeDays,
      verification_status: c.verificationStatus,
      verified_at: c.verifiedAt?.toISOString() ?? null,
      verified_by: c.verifiedBy,
    })),
    certifications: certifications.map((c) => ({
      id: c.id,
      certification_type: c.certificationType,
      issuer: c.issuer,
      reference_number: c.referenceNumber,
      issued_on: c.issuedOn,
      expires_on: c.expiresOn,
      verification_status: c.verificationStatus,
      verified_at: c.verifiedAt?.toISOString() ?? null,
      verified_by: c.verifiedBy,
    })),
    status_events: statusEvents.map((e) => ({
      id: e.id,
      from_status: e.fromStatus,
      to_status: e.toStatus,
      actor: e.actor,
      reason: e.reason,
      occurred_at: e.occurredAt.toISOString(),
    })),
  })
}
