import "server-only"
import { eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import {
  supplierCapabilities,
  supplierCertifications,
  supplierContacts,
  supplierOrganisations,
  supplierStatusEvents,
} from "@/lib/db/schema"
import { assertSupplierStatusTransition } from "./lifecycle"
import type { SupplierApplicationInput } from "@/lib/validation/supplier-application"

export const getSupplierApplicationForCustomer = async (medusaCustomerId: string) => {
  const db = getDb()
  const [organisation] = await db
    .select()
    .from(supplierOrganisations)
    .where(eq(supplierOrganisations.medusaCustomerId, medusaCustomerId))
    .limit(1)
  if (!organisation) return null

  const [capabilities, certifications] = await Promise.all([
    db
      .select()
      .from(supplierCapabilities)
      .where(eq(supplierCapabilities.supplierOrganisationId, organisation.id)),
    db
      .select()
      .from(supplierCertifications)
      .where(eq(supplierCertifications.supplierOrganisationId, organisation.id)),
  ])

  return { organisation, capabilities, certifications }
}

/**
 * Creates a supplier application already in `submitted` status (this
 * increment collects everything in one form, so there is no separate
 * "save draft" step yet — draft/under_review/etc. remain real states for a
 * future multi-step flow and staff review, not dead enum values).
 */
export const submitSupplierApplication = async (
  medusaCustomerId: string,
  input: SupplierApplicationInput,
) => {
  const db = getDb()

  return db.transaction(async (tx) => {
    assertSupplierStatusTransition("draft", "submitted")

    const [organisation] = await tx
      .insert(supplierOrganisations)
      .values({
        medusaCustomerId,
        legalName: input.legalName,
        registrationNumber: input.registrationNumber,
        taxIdentifier: input.taxIdentifier,
        countryCode: input.countryCode,
        status: "submitted",
        submittedAt: new Date(),
      })
      .returning()

    await tx.insert(supplierContacts).values({
      supplierOrganisationId: organisation.id,
      name: input.contactName,
      email: input.contactEmail,
      role: input.contactRole,
      phone: input.contactPhone,
    })

    if (input.capabilities.length > 0) {
      await tx.insert(supplierCapabilities).values(
        input.capabilities.map((capability) => ({
          supplierOrganisationId: organisation.id,
          productCategory: capability.category,
          variety: capability.variety,
          grade: capability.grade,
          originCountryCode: capability.originCountryCode,
          capacityDescription: capability.capacityDescription,
          season: capability.season,
          leadTimeDays: capability.leadTimeDays,
        })),
      )
    }

    if (input.certifications.length > 0) {
      await tx.insert(supplierCertifications).values(
        input.certifications.map((certification) => ({
          supplierOrganisationId: organisation.id,
          certificationType: certification.certificationType,
          issuer: certification.issuer,
          referenceNumber: certification.referenceNumber,
          issuedOn: certification.issuedOn,
          expiresOn: certification.expiresOn,
        })),
      )
    }

    await tx.insert(supplierStatusEvents).values({
      supplierOrganisationId: organisation.id,
      fromStatus: "draft",
      toStatus: "submitted",
      actor: `customer:${medusaCustomerId}`,
      reason: "Application submitted by applicant.",
    })

    return organisation
  })
}

/**
 * Sets supplier_organisations.canonical_organisation_id (ADR-0006's
 * reserved reconciliation column, ADR-0009's linkage route) -- the
 * counterpart to baobab-trade's b2b_organisation.canonical_organisation_id
 * write path from Gate ZB-03.3. Never called by application code directly;
 * only by the admin-authenticated route (src/app/api/admin/suppliers/[id]/
 * canonical-link/route.ts). Returns null when supplierOrganisationId does
 * not name an existing row, so the route can answer 404 rather than a
 * silent no-op update.
 */
export const setSupplierCanonicalOrganisationId = async (
  supplierOrganisationId: string,
  canonicalOrganisationId: string,
) => {
  const db = getDb()
  const [organisation] = await db
    .update(supplierOrganisations)
    .set({ canonicalOrganisationId, updatedAt: new Date() })
    .where(eq(supplierOrganisations.id, supplierOrganisationId))
    .returning()
  return organisation ?? null
}
