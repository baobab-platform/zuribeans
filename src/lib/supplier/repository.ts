import "server-only"
import { and, desc, eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import {
  supplierCapabilities,
  supplierCertifications,
  supplierContacts,
  supplierDocumentReferences,
  supplierOrganisations,
  supplierStatusEvents,
} from "@/lib/db/schema"
import {
  assertSupplierStatusTransition,
  type SupplierStatus,
} from "./lifecycle"
import {
  estateApplicationId,
  enqueueSupplierOutboxEvent,
  SUPPLIER_EVENT_TYPES,
} from "./outbox"
import type { SupplierApplicationInput } from "@/lib/validation/supplier-application"

const APPLICANT_EDITABLE: readonly SupplierStatus[] = [
  "more_information_required",
  "sample_required",
]

const DECISION_STATUSES: readonly SupplierStatus[] = ["approved", "rejected"]

export const getSupplierApplicationForCustomer = async (medusaCustomerId: string) => {
  const db = getDb()
  const [organisation] = await db
    .select()
    .from(supplierOrganisations)
    .where(eq(supplierOrganisations.medusaCustomerId, medusaCustomerId))
    .limit(1)
  if (!organisation) return null

  const [capabilities, certifications, latestStatusEvent, documents] = await Promise.all([
    db
      .select()
      .from(supplierCapabilities)
      .where(eq(supplierCapabilities.supplierOrganisationId, organisation.id)),
    db
      .select()
      .from(supplierCertifications)
      .where(eq(supplierCertifications.supplierOrganisationId, organisation.id)),
    db
      .select()
      .from(supplierStatusEvents)
      .where(eq(supplierStatusEvents.supplierOrganisationId, organisation.id))
      .orderBy(desc(supplierStatusEvents.occurredAt))
      .limit(1),
    db
      .select()
      .from(supplierDocumentReferences)
      .where(eq(supplierDocumentReferences.supplierOrganisationId, organisation.id)),
  ])

  return {
    organisation,
    capabilities,
    certifications,
    documents,
    latestStatusEvent: latestStatusEvent[0] ?? null,
  }
}

export const submitSupplierApplication = async (
  medusaCustomerId: string,
  input: SupplierApplicationInput,
) => {
  const db = getDb()

  const organisation = await db.transaction(async (tx) => {
    assertSupplierStatusTransition("draft", "submitted")

    const [created] = await tx
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
      supplierOrganisationId: created.id,
      name: input.contactName,
      email: input.contactEmail,
      role: input.contactRole,
      phone: input.contactPhone,
    })

    if (input.capabilities.length > 0) {
      await tx.insert(supplierCapabilities).values(
        input.capabilities.map((capability) => ({
          supplierOrganisationId: created.id,
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
          supplierOrganisationId: created.id,
          certificationType: certification.certificationType,
          issuer: certification.issuer,
          referenceNumber: certification.referenceNumber,
          issuedOn: certification.issuedOn,
          expiresOn: certification.expiresOn,
        })),
      )
    }

    await tx.insert(supplierStatusEvents).values({
      supplierOrganisationId: created.id,
      fromStatus: "draft",
      toStatus: "submitted",
      actor: `customer:${medusaCustomerId}`,
      reason: "Application submitted by applicant.",
    })

    return created
  })

  await enqueueSupplierOutboxEvent({
    eventType: SUPPLIER_EVENT_TYPES.applicationSubmitted,
    subject: estateApplicationId(organisation.id),
    data: {
      estate_id: "ZURIBEANS",
      legal_entity_id: "ZURIBEANS",
      application_id: estateApplicationId(organisation.id),
      canonical_organisation_id: organisation.canonicalOrganisationId,
      legal_name: organisation.legalName,
      country_code: organisation.countryCode,
      product_categories: input.capabilities.map((c) => c.category),
      submitted_at: organisation.submittedAt?.toISOString() ?? new Date().toISOString(),
      revision: 1,
    },
  })

  return organisation
}

export const resubmitSupplierApplication = async (
  medusaCustomerId: string,
  input: SupplierApplicationInput,
  note?: string,
) => {
  const db = getDb()

  const updated = await db.transaction(async (tx) => {
    const [organisation] = await tx
      .select()
      .from(supplierOrganisations)
      .where(eq(supplierOrganisations.medusaCustomerId, medusaCustomerId))
      .limit(1)

    if (!organisation) return null

    const fromStatus = organisation.status as SupplierStatus
    if (!APPLICANT_EDITABLE.includes(fromStatus)) {
      throw new Error(
        `Cannot resubmit a supplier application from "${fromStatus}" — only more_information_required or sample_required allow applicant updates.`,
      )
    }

    assertSupplierStatusTransition(fromStatus, "under_review")

    const [row] = await tx
      .update(supplierOrganisations)
      .set({
        legalName: input.legalName,
        registrationNumber: input.registrationNumber,
        taxIdentifier: input.taxIdentifier,
        countryCode: input.countryCode,
        status: "under_review",
        updatedAt: new Date(),
      })
      .where(eq(supplierOrganisations.id, organisation.id))
      .returning()

    await tx.delete(supplierContacts).where(eq(supplierContacts.supplierOrganisationId, organisation.id))
    await tx
      .delete(supplierCapabilities)
      .where(eq(supplierCapabilities.supplierOrganisationId, organisation.id))
    await tx
      .delete(supplierCertifications)
      .where(eq(supplierCertifications.supplierOrganisationId, organisation.id))

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
      fromStatus,
      toStatus: "under_review",
      actor: `customer:${medusaCustomerId}`,
      reason: note?.trim() || "Applicant resubmitted updated information.",
    })

    return row
  })

  if (updated) {
    await enqueueSupplierOutboxEvent({
      eventType: SUPPLIER_EVENT_TYPES.qualificationUpdated,
      subject: estateApplicationId(updated.id),
      data: {
        application_id: estateApplicationId(updated.id),
        status: "under_review",
        reason: note?.trim() || "Applicant resubmitted updated information.",
      },
    })
  }

  return updated
}

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

export const listSupplierApplications = async (options?: {
  status?: SupplierStatus
  limit?: number
}) => {
  const db = getDb()
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100)

  const rows = options?.status
    ? await db
        .select()
        .from(supplierOrganisations)
        .where(eq(supplierOrganisations.status, options.status))
        .orderBy(desc(supplierOrganisations.submittedAt), desc(supplierOrganisations.createdAt))
        .limit(limit)
    : await db
        .select()
        .from(supplierOrganisations)
        .orderBy(desc(supplierOrganisations.submittedAt), desc(supplierOrganisations.createdAt))
        .limit(limit)

  return rows
}

export const getSupplierApplicationById = async (supplierOrganisationId: string) => {
  const db = getDb()
  const [organisation] = await db
    .select()
    .from(supplierOrganisations)
    .where(eq(supplierOrganisations.id, supplierOrganisationId))
    .limit(1)
  if (!organisation) return null

  const [capabilities, certifications, contacts, statusEvents, documents] = await Promise.all([
    db
      .select()
      .from(supplierCapabilities)
      .where(eq(supplierCapabilities.supplierOrganisationId, organisation.id)),
    db
      .select()
      .from(supplierCertifications)
      .where(eq(supplierCertifications.supplierOrganisationId, organisation.id)),
    db
      .select()
      .from(supplierContacts)
      .where(eq(supplierContacts.supplierOrganisationId, organisation.id)),
    db
      .select()
      .from(supplierStatusEvents)
      .where(eq(supplierStatusEvents.supplierOrganisationId, organisation.id))
      .orderBy(desc(supplierStatusEvents.occurredAt)),
    db
      .select()
      .from(supplierDocumentReferences)
      .where(eq(supplierDocumentReferences.supplierOrganisationId, organisation.id)),
  ])

  return { organisation, capabilities, certifications, contacts, statusEvents, documents }
}

export const transitionSupplierStatus = async (input: {
  supplierOrganisationId: string
  toStatus: SupplierStatus
  actor: string
  reason?: string
}) => {
  const db = getDb()

  const updated = await db.transaction(async (tx) => {
    const [organisation] = await tx
      .select()
      .from(supplierOrganisations)
      .where(eq(supplierOrganisations.id, input.supplierOrganisationId))
      .limit(1)

    if (!organisation) return null

    const fromStatus = organisation.status as SupplierStatus
    assertSupplierStatusTransition(fromStatus, input.toStatus)

    const [row] = await tx
      .update(supplierOrganisations)
      .set({ status: input.toStatus, updatedAt: new Date() })
      .where(eq(supplierOrganisations.id, organisation.id))
      .returning()

    await tx.insert(supplierStatusEvents).values({
      supplierOrganisationId: organisation.id,
      fromStatus,
      toStatus: input.toStatus,
      actor: input.actor,
      reason: input.reason ?? null,
    })

    return row
  })

  if (updated && DECISION_STATUSES.includes(input.toStatus)) {
    await enqueueSupplierOutboxEvent({
      eventType: SUPPLIER_EVENT_TYPES.applicationDecided,
      subject: estateApplicationId(updated.id),
      data: {
        application_id: estateApplicationId(updated.id),
        decision: input.toStatus,
        actor: input.actor,
        reason: input.reason ?? null,
      },
    })
  } else if (updated) {
    await enqueueSupplierOutboxEvent({
      eventType: SUPPLIER_EVENT_TYPES.qualificationUpdated,
      subject: estateApplicationId(updated.id),
      data: {
        application_id: estateApplicationId(updated.id),
        status: input.toStatus,
        actor: input.actor,
        reason: input.reason ?? null,
      },
    })
  }

  return updated
}

type VerificationOutcome = "verified" | "rejected"

export const setCapabilityVerification = async (input: {
  supplierOrganisationId: string
  capabilityId: string
  status: VerificationOutcome
  verifiedBy: string
}) => {
  const db = getDb()
  const [row] = await db
    .update(supplierCapabilities)
    .set({
      verificationStatus: input.status,
      verifiedAt: new Date(),
      verifiedBy: input.verifiedBy,
    })
    .where(
      and(
        eq(supplierCapabilities.id, input.capabilityId),
        eq(supplierCapabilities.supplierOrganisationId, input.supplierOrganisationId),
      ),
    )
    .returning()

  if (row) {
    await enqueueSupplierOutboxEvent({
      eventType: SUPPLIER_EVENT_TYPES.capabilityVerified,
      subject: estateApplicationId(input.supplierOrganisationId),
      data: {
        application_id: estateApplicationId(input.supplierOrganisationId),
        capability_id: row.id,
        product_category: row.productCategory,
        verification_status: input.status,
        verified_by: input.verifiedBy,
      },
    })
  }

  return row ?? null
}

export const setCertificationVerification = async (input: {
  supplierOrganisationId: string
  certificationId: string
  status: VerificationOutcome
  verifiedBy: string
}) => {
  const db = getDb()
  const [row] = await db
    .update(supplierCertifications)
    .set({
      verificationStatus: input.status,
      verifiedAt: new Date(),
      verifiedBy: input.verifiedBy,
    })
    .where(
      and(
        eq(supplierCertifications.id, input.certificationId),
        eq(supplierCertifications.supplierOrganisationId, input.supplierOrganisationId),
      ),
    )
    .returning()
  return row ?? null
}

export const addSupplierDocumentReference = async (input: {
  supplierOrganisationId: string
  kind: string
  label: string
  externalReference?: string
  contentHash?: string
  recordedBy: string
}) => {
  const db = getDb()
  const [row] = await db
    .insert(supplierDocumentReferences)
    .values({
      supplierOrganisationId: input.supplierOrganisationId,
      kind: input.kind,
      label: input.label,
      externalReference: input.externalReference ?? null,
      contentHash: input.contentHash ?? null,
      recordedBy: input.recordedBy,
    })
    .returning()
  return row
}

export const setErpProjectionStatus = async (input: {
  supplierOrganisationId: string
  status: "NOT_REQUESTED" | "READY" | "PENDING" | "FAILED" | "PROJECTED"
  actor: string
  /** Shared public erp_* id only — set on PROJECTED (ADR-0013). */
  erpBusinessPartnerId?: string
}) => {
  const db = getDb()
  const [organisation] = await db
    .select()
    .from(supplierOrganisations)
    .where(eq(supplierOrganisations.id, input.supplierOrganisationId))
    .limit(1)

  if (!organisation) return null

  if (input.status === "READY") {
    const st = organisation.status as SupplierStatus
    if (st !== "approved" && st !== "active") {
      throw new Error("ERP projection READY is only allowed when the supplier is approved or active.")
    }
  }

  const patch: {
    erpProjectionStatus: typeof input.status
    updatedAt: Date
    erpBusinessPartnerId?: string
  } = {
    erpProjectionStatus: input.status,
    updatedAt: new Date(),
  }
  if (input.status === "PROJECTED" && input.erpBusinessPartnerId) {
    patch.erpBusinessPartnerId = input.erpBusinessPartnerId
  }

  const [updated] = await db
    .update(supplierOrganisations)
    .set(patch)
    .where(eq(supplierOrganisations.id, organisation.id))
    .returning()

  const reason =
    input.status === "PROJECTED" && input.erpBusinessPartnerId
      ? `erp_projection_status=${input.status}; erp_business_partner_id=${input.erpBusinessPartnerId}`
      : `erp_projection_status=${input.status}`

  await db.insert(supplierStatusEvents).values({
    supplierOrganisationId: organisation.id,
    fromStatus: organisation.status,
    toStatus: organisation.status,
    actor: input.actor,
    reason,
  })

  return updated
}
