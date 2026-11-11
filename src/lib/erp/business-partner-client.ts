import "server-only"
import { z } from "zod"
import { limitedBody } from "@/lib/iam/oidc/transport"
import { publicErpBusinessPartnerId } from "./public-identifier"
export { publicErpBusinessPartnerId } from "./public-identifier"

/** Legacy, opt-in supplier adapter. The current ERP owner exposes no
 * /business-partners/project operation: configuration is not qualification.
 * ADR-ERP-021 proposes client topology, not this API. Owner contract adoption
 * and native supplier/provider evidence remain required before activation.
 */
const canonicalId = z
  .string()
  .min(3)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/)
const legalEntityId = z
  .string()
  .min(3)
  .max(63)
  .regex(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/)
const inputSchema = z
  .object({
    canonicalOrganisationId: canonicalId,
    displayName: z
      .string()
      .min(1)
      .max(255)
      .refine((v) => v.trim().length > 0 && !/[\x00-\x1f]/.test(v)),
    countryCode: z.string().regex(/^[A-Z]{2}$/),
    readinessStatus: z.literal("READY"),
  })
  .strict()
const projectionSchema = z
  .object({
    legal_entity_id: legalEntityId,
    business_partner_id: publicErpBusinessPartnerId,
    source_customer_id: canonicalId.optional(),
    roles: z
      .array(z.enum(["customer", "supplier", "employee", "other"]))
      .min(1)
      .refine((v) => new Set(v).size === v.length && v.includes("supplier")),
    display_name: z.string().min(1).max(255),
    status: z.literal("active"),
    revision: z.number().int().positive().safe(),
    billing_country: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
    default_currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .optional(),
  })
  .strict()
export type ErpBusinessPartnerProjection = z.infer<typeof projectionSchema>
export type ProjectBusinessPartnerInput = z.infer<typeof inputSchema>
export type ProjectBusinessPartnerResult =
  | { ok: true; projection: ErpBusinessPartnerProjection }
  | {
      ok: false
      reason:
        "not_configured" | "invalid_request" | "http_error" | "invalid_response" | "outcome_unknown"
      detail: string
    }

const getErpConfig = () => {
  try {
    const raw = process.env.BAOBAB_ERP_BASE_URL ?? ""
    const url = new URL(raw)
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/" ||
      ![url.origin, url.origin + "/"].includes(raw) ||
      process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
    )
      return null
    return {
      baseUrl: url.origin,
      token: z
        .string()
        .min(16)
        .max(16384)
        .regex(/^\S+$/)
        .parse(process.env.BAOBAB_ERP_WORKLOAD_TOKEN),
      engineInstanceId: z
        .string()
        .min(6)
        .max(63)
        .regex(/^ei_[a-z0-9]+$/)
        .parse(process.env.BAOBAB_ERP_ENGINE_INSTANCE_ID),
      tenantId: z
        .string()
        .min(6)
        .max(63)
        .regex(/^tn_[a-z0-9]+$/)
        .parse(process.env.BAOBAB_ERP_TENANT_ID),
      entityId: legalEntityId.parse(process.env.BAOBAB_ERP_LEGAL_ENTITY_ID),
    }
  } catch {
    return null
  }
}
export const isErpProjectionConfigured = (): boolean => getErpConfig() !== null

export const projectSupplierBusinessPartner = async (
  input: ProjectBusinessPartnerInput,
): Promise<ProjectBusinessPartnerResult> => {
  const config = getErpConfig()
  if (!config)
    return {
      ok: false,
      reason: "not_configured",
      detail: "A complete, canonical ERP deployment configuration with verified HTTPS is required.",
    }
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success)
    return { ok: false, reason: "invalid_request", detail: "Supplier projection input is invalid." }
  let response: Response
  const signal = AbortSignal.timeout(5000)
  try {
    response = await fetch(`${config.baseUrl}/business-partners/project`, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal,
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        tenant_id: config.tenantId,
        entity_id: config.entityId,
        engine_instance_id: config.engineInstanceId,
        canonical_organisation_id: parsed.data.canonicalOrganisationId,
        display_name: parsed.data.displayName,
        readiness_status: parsed.data.readinessStatus,
        roles: ["supplier"],
        billing_country: parsed.data.countryCode,
        source_version: "1",
        status: "active",
      }),
    })
  } catch {
    // A timeout/lost response may follow a native effect. Do not mark this
    // retryable or invent a provider receipt; reconciliation must decide.
    return {
      ok: false,
      reason: "outcome_unknown",
      detail: "ERP outcome is unknown; reconcile before retrying.",
    }
  }
  if (!response.ok) {
    void response.body?.cancel().catch(() => undefined)
    return response.status >= 400 && response.status < 500
      ? { ok: false, reason: "http_error", detail: "ERP refused the supplier projection request." }
      : {
          ok: false,
          reason: "outcome_unknown",
          detail: "ERP outcome is unknown; reconcile before retrying.",
        }
  }
  try {
    if (!/^application\/json(?:;|$)/i.test(response.headers.get("content-type") ?? ""))
      throw new Error()
    const bytes = await limitedBody(response.body, signal, 65536)
    // A BusinessPartner projection alone identifies no canonical supplier.
    // This candidate adapter requires an explicit exact-scope receipt wrapper;
    // active Shared/ERP contract adoption is still an open provider gate.
    const json = z
      .object({
        tenant_id: z.literal(config.tenantId),
        engine_instance_id: z.literal(config.engineInstanceId),
        canonical_organisation_id: z.literal(parsed.data.canonicalOrganisationId),
        business_partner: projectionSchema,
      })
      .strict()
      .parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)))
    const projection = json.business_partner
    if (
      projection.legal_entity_id !== config.entityId ||
      (projection.billing_country !== undefined &&
        projection.billing_country !== parsed.data.countryCode)
    )
      throw new Error()
    return { ok: true, projection }
  } catch {
    void response.body?.cancel().catch(() => undefined)
    return {
      ok: false,
      reason: "invalid_response",
      detail: "ERP returned no valid matching supplier receipt; reconcile before retrying.",
    }
  }
}
