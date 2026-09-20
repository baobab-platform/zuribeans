import "server-only"

/**
 * Calls baobab-erp POST /business-partners/project (ADR-ERP-021).
 * Optional until BAOBAB_ERP_* is configured — callers treat missing config as
 * "not ready to project" rather than inventing a local C_BPartner.
 */

export type ErpBusinessPartnerProjection = {
  legal_entity_id: string
  business_partner_id: string
  roles: string[]
  display_name: string
  status: string
  revision: number
  billing_country?: string
  default_currency?: string
}

export type ProjectBusinessPartnerInput = {
  canonicalOrganisationId: string
  displayName: string
  countryCode: string
  readinessStatus: "READY"
}

export type ProjectBusinessPartnerResult =
  | { ok: true; projection: ErpBusinessPartnerProjection }
  | { ok: false; reason: "not_configured" | "http_error" | "invalid_response"; detail: string }

const getErpConfig = () => {
  const baseUrl = process.env.BAOBAB_ERP_BASE_URL?.replace(/\/$/, "")
  const token = process.env.BAOBAB_ERP_WORKLOAD_TOKEN
  const engineInstanceId = process.env.BAOBAB_ERP_ENGINE_INSTANCE_ID ?? "erp-zuribeans"
  const tenantId = process.env.BAOBAB_ERP_TENANT_ID
  const entityId = process.env.BAOBAB_ERP_LEGAL_ENTITY_ID
  if (!baseUrl || !token || !tenantId || !entityId) {
    return null
  }
  return { baseUrl, token, engineInstanceId, tenantId, entityId }
}

export const isErpProjectionConfigured = (): boolean => getErpConfig() !== null

export const projectSupplierBusinessPartner = async (
  input: ProjectBusinessPartnerInput,
): Promise<ProjectBusinessPartnerResult> => {
  const config = getErpConfig()
  if (!config) {
    return {
      ok: false,
      reason: "not_configured",
      detail:
        "BAOBAB_ERP_BASE_URL, BAOBAB_ERP_WORKLOAD_TOKEN, BAOBAB_ERP_TENANT_ID, and BAOBAB_ERP_LEGAL_ENTITY_ID are required.",
    }
  }

  const response = await fetch(`${config.baseUrl}/business-partners/project`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      tenant_id: config.tenantId,
      entity_id: config.entityId,
      engine_instance_id: config.engineInstanceId,
      canonical_organisation_id: input.canonicalOrganisationId,
      display_name: input.displayName,
      readiness_status: input.readinessStatus,
      roles: ["supplier"],
      billing_country: input.countryCode,
      source_version: "1",
      status: "active",
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    return {
      ok: false,
      reason: "http_error",
      detail: `ERP responded ${response.status}: ${text.slice(0, 500)}`,
    }
  }

  const json = (await response.json()) as {
    business_partner?: ErpBusinessPartnerProjection
  }
  if (!json.business_partner?.business_partner_id) {
    return {
      ok: false,
      reason: "invalid_response",
      detail: "ERP response missing business_partner.business_partner_id",
    }
  }

  return { ok: true, projection: json.business_partner }
}
