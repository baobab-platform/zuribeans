// Gate ZB-03.5 (Supplier identity integration): the supplier-side
// counterpart to baobab-trade's POST /admin/b2b/organisations/{id}/
// canonical-link (Gate ZB-03.3) -- the onboarding/backfill mechanism that
// sets supplier_organisations.canonical_organisation_id (ADR-0006's
// reserved reconciliation column, never populated by any code path until
// now). An operator uses this after linking the same canonical identity to
// a SUPPLIER_ORGANISATION CanonicalEntity in baobab-cp (POST /v1/
// canonical-entities/{entityID}/external-references), so the two engines
// agree on one canonical_organisation_id for the same real-world supplier.
//
// Gated by an interim internal-API-key secret (ADR-0009), not a Medusa
// actor or a baobab-cp Principal -- neither is reachable from zuribeans'
// own, separate Postgres/drizzle module (see src/lib/db/client.ts's doc
// comment: "never shared with, and never a copy of, any Baobab engine's
// database").
import "server-only"
import { z } from "zod"
import { getSupplierAdminEnvironment } from "@/lib/configuration/environment"
import { isAuthorizedInternalRequest } from "@/lib/auth/internal-api-key"
import { setSupplierCanonicalOrganisationId } from "@/lib/supplier/repository"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  canonical_organisation_id: z.string().min(1, "canonical_organisation_id is required."),
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

  const { id } = await params
  const organisation = await setSupplierCanonicalOrganisationId(
    id,
    parsed.data.canonical_organisation_id,
  )
  if (!organisation) {
    return Response.json({ error: "not_found" }, { status: 404 })
  }

  return Response.json({
    id: organisation.id,
    canonical_organisation_id: organisation.canonicalOrganisationId,
  })
}
