import "server-only"
import {
  isErpProjectionConfigured,
  projectSupplierBusinessPartner,
  publicErpBusinessPartnerId,
} from "@/lib/erp/business-partner-client"
import { getSupplierApplicationById, setErpProjectionStatus } from "@/lib/supplier/repository"

/** Shared erp/v1 public identifier only (ADR-ERP-021 / ADR-0013). */
export const isPublicErpBusinessPartnerId = (value: string): boolean =>
  publicErpBusinessPartnerId.safeParse(value).success

/**
 * READY → PENDING → PROJECTED | FAILED handoff (ADR-0012 / ADR-ERP-021).
 * Does not invent a Business Partner locally.
 */
export const requestErpBusinessPartnerProjection = async (input: {
  supplierOrganisationId: string
  actor: string
}) => {
  const detail = await getSupplierApplicationById(input.supplierOrganisationId)
  if (!detail) {
    return { ok: false as const, error: "not_found" as const }
  }

  const { organisation } = detail
  if (
    organisation.erpProjectionStatus !== "READY" &&
    organisation.erpProjectionStatus !== "FAILED"
  ) {
    return {
      ok: false as const,
      error: "not_ready" as const,
      detail: `erp_projection_status must be READY or FAILED to project (got ${organisation.erpProjectionStatus})`,
    }
  }

  if (organisation.status !== "approved" && organisation.status !== "active") {
    return {
      ok: false as const,
      error: "supplier_not_approved" as const,
      detail: "Supplier must be approved or active before ERP projection.",
    }
  }

  if (!organisation.canonicalOrganisationId) {
    return {
      ok: false as const,
      error: "missing_canonical" as const,
      detail: "canonical_organisation_id is required before ERP projection.",
    }
  }

  if (!isErpProjectionConfigured()) {
    return {
      ok: false as const,
      error: "erp_not_configured" as const,
      detail: "ERP client is not configured in this estate environment. Status left unchanged.",
    }
  }

  try {
    const claimed = await setErpProjectionStatus({
      supplierOrganisationId: organisation.id,
      status: "PENDING",
      actor: input.actor,
    })
    if (!claimed) return { ok: false as const, error: "not_found" as const }
  } catch {
    return {
      ok: false as const,
      error: "erp_failed" as const,
      detail: "Supplier handoff is unavailable or already in progress.",
    }
  }

  const result = await projectSupplierBusinessPartner({
    canonicalOrganisationId: organisation.canonicalOrganisationId,
    displayName: organisation.legalName,
    countryCode: organisation.countryCode,
    readinessStatus: "READY",
  })

  if (!result.ok) {
    if (["not_configured", "invalid_request", "http_error"].includes(result.reason)) {
      await setErpProjectionStatus({
        supplierOrganisationId: organisation.id,
        status: "FAILED",
        actor: input.actor,
      })
    }
    // A missing/malformed reply or server/transport failure can follow an
    // actual native effect. Retain PENDING until owner reconciliation; a UI
    // retry must not create a second Business Partner.
    return {
      ok: false as const,
      error: "erp_failed" as const,
      detail: result.detail,
    }
  }

  const publicId = result.projection.business_partner_id
  if (!isPublicErpBusinessPartnerId(publicId)) {
    return {
      ok: false as const,
      error: "erp_failed" as const,
      detail: "ERP returned no valid public identifier; reconcile before retrying.",
    }
  }

  await setErpProjectionStatus({
    supplierOrganisationId: organisation.id,
    status: "PROJECTED",
    actor: input.actor,
    erpBusinessPartnerId: publicId,
  })

  return {
    ok: true as const,
    businessPartnerId: publicId,
    projection: result.projection,
  }
}
